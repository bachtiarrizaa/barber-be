import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ITransaction, Transaction } from '../entities/transaction.entity';
import { TransactionRepository } from '../repositories/transaction.repository';
import { User } from '../../users/entities/user.entity';
import { UserRepository } from '../../users/repositories/user.repository';
import { Treatment } from '../../treatments/entities/treatment.entity';
import { TreatmentRepository } from '../../treatments/repositories/treatment.repository';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { Customer, ICustomer } from '../../customers/entities/customer.entity';
import { CustomerRepository } from '../../customers/repositories/customer.repository';
import {
  FinalizeTransactionParams,
  TransactionItemSnapshot,
} from '../interfaces/transaction.interface';
import { ItemType } from '../enums/item-type.enum';
import { Product } from '../../products/entities/product.entity';
import { ProductRepository } from '../../products/repositories/product.repository';
import { StockLog } from '../../stock/entities/stock-log.entity';
import {
  IVoucherRedemption,
  VoucherRedemption,
} from '../../vouchers/entities/voucher-redemption.entity';
import { VoucherRedemptionRepository } from '../../vouchers/repositories/voucher-redemption.repository';
import { SettingService } from '../../settings/services/setting.service';
import { PointLog } from '../../customers/entities/point-log.entity';
import { TransactionItem } from '../entities/transaction-item.entity';
import { FilterTransactionDto } from '../dtos/filter-transaction.dto';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: TransactionRepository,
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
    @InjectRepository(Treatment)
    private readonly treatmentRepository: TreatmentRepository,
    @InjectRepository(Customer)
    private readonly customerRepository: CustomerRepository,
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
    @InjectRepository(VoucherRedemption)
    private readonly voucherRedemptionRepository: VoucherRedemptionRepository,
    private readonly settingService: SettingService,
    private readonly em: EntityManager,
  ) {}

  async create(
    createTransationDto: CreateTransactionDto,
    cashierId: string,
  ): Promise<ITransaction> {
    const barber = await this.userRepository.findOne(
      { id: createTransationDto.barberId },
      { populate: ['role'] },
    );
    if (!barber) {
      throw new NotFoundException('Barber not found');
    }
    if (barber.role.name !== 'barber') {
      throw new BadRequestException('Selected user is not a barber');
    }

    const cashier = await this.userRepository.findById(cashierId);
    if (!cashier) {
      throw new NotFoundException('Cashier not found');
    }

    let customer: ICustomer | null = null;

    if (createTransationDto.customerId) {
      customer = await this.customerRepository.findById(
        createTransationDto.customerId,
      );
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    const transactionItems = await this.transactionItem(
      createTransationDto.items,
    );

    const subtotal = transactionItems.reduce(
      (sum, i) => sum + parseFloat(i.subtotal),
      0,
    );

    const totalTreatmentAmount = transactionItems
      .filter((i) => i.itemType === ItemType.TREATMENT)
      .reduce((sum, i) => sum + parseFloat(i.subtotal), 0);
    const totalProductAmount = transactionItems
      .filter((i) => i.itemType === ItemType.PRODUCT)
      .reduce((sum, i) => sum + parseFloat(i.subtotal), 0);

    let discountAmount = 0;
    let voucherRedemption: IVoucherRedemption | null = null;

    if (createTransationDto.voucherRedemptionId) {
      if (!customer) {
        throw new BadRequestException('Voucher redemption requires a customer');
      }

      voucherRedemption = await this.voucherRedemptionRepository.findOne(
        { id: createTransationDto.voucherRedemptionId, customer: customer.id },
        { populate: ['voucher'] as const },
      );

      if (!voucherRedemption) {
        throw new NotFoundException('Voucher redemption not found');
      }
      if (voucherRedemption.isUsed) {
        throw new BadRequestException('Voucher redemption already used');
      }
      if (voucherRedemption.expiredAt < new Date()) {
        throw new BadRequestException('Voucher redemption has expired');
      }

      const voucher = voucherRedemption.voucher;
      if (voucher.type === 'percent') {
        discountAmount = subtotal * (parseFloat(voucher.value) / 100);
      } else {
        discountAmount = parseFloat(voucher.value);
      }
    }

    // Cap discount so total never goes negative
    discountAmount = Math.min(discountAmount, subtotal);

    const total = subtotal - discountAmount;

    const serviceCommissionRate = parseFloat(barber.treatmentCommission);
    const productCommissionRate = parseFloat(barber.productCommission);
    const serviceCommissionAmount =
      totalTreatmentAmount * (serviceCommissionRate / 100);
    const productCommissionAmount =
      totalProductAmount * (productCommissionRate / 100);
    const totalCommissionAmount =
      serviceCommissionAmount + productCommissionAmount;

    if (createTransationDto.paymentMethod === 'cash') {
      const amountPaid = createTransationDto.amountPaid ?? 0;
      if (amountPaid < total) {
        throw new BadRequestException(
          `Amount paid (${amountPaid}) is less than total (${total.toFixed(2)})`,
        );
      }
      const changeAmount = amountPaid - total;

      return this.finalizeTransaction({
        cashier,
        barber,
        customer,
        transactionItems,
        subtotal,
        discountAmount,
        total,
        totalServiceAmount: totalTreatmentAmount,
        totalProductAmount,
        serviceCommissionRate,
        productCommissionRate,
        serviceCommissionAmount,
        productCommissionAmount,
        totalCommissionAmount,
        amountPaid,
        changeAmount,
        voucherRedemption,
      });
    }

    // Non-cash path — Xendit invoice creation
    // TODO: integrate Xendit module — placeholder for now
    throw new BadRequestException(
      'Non-cash payment is not yet supported. Xendit integration pending.',
    );
  }

  private async transactionItem(
    items: CreateTransactionDto['items'],
  ): Promise<TransactionItemSnapshot[]> {
    const transaction: TransactionItemSnapshot[] = [];

    for (const item of items) {
      if (item.itemType === ItemType.TREATMENT) {
        const treatment = await this.treatmentRepository.findActiveById(
          item.itemId,
        );
        if (!treatment) {
          throw new NotFoundException(
            `Treatment with id ${item.itemId} not found or inactive`,
          );
        }
        const subtotal = parseFloat(treatment.price) * item.quantity;
        transaction.push({
          itemType: ItemType.TREATMENT,
          itemId: treatment.id,
          itemName: treatment.name,
          price: treatment.price,
          quantity: item.quantity,
          subtotal: subtotal.toFixed(2),
        });
      } else {
        const product = await this.productRepository.findActiveById(
          item.itemId,
        );
        if (!product) {
          throw new NotFoundException(
            `Product with id ${item.itemId} not found or inactive`,
          );
        }

        const subtotal = parseFloat(product.price) * item.quantity;
        transaction.push({
          itemType: ItemType.PRODUCT,
          itemId: product.id,
          itemName: product.name,
          price: product.price,
          quantity: item.quantity,
          subtotal: subtotal.toFixed(2),
        });
      }
    }

    return transaction;
  }

  private async finalizeTransaction(
    params: FinalizeTransactionParams,
  ): Promise<ITransaction> {
    const {
      cashier,
      barber,
      customer,
      transactionItems,
      subtotal,
      discountAmount,
      total,
      totalServiceAmount,
      totalProductAmount,
      serviceCommissionRate,
      productCommissionRate,
      serviceCommissionAmount,
      productCommissionAmount,
      totalCommissionAmount,
      amountPaid,
      changeAmount,
      voucherRedemption,
    } = params;

    const pointsAmountPerUnit = parseInt(
      await this.settingService.getValue('points_amount_per_unit'),
      10,
    );
    const pointsUnitValue = parseInt(
      await this.settingService.getValue('points_unit_value'),
      10,
    );
    const minTransactionForPoints = parseInt(
      await this.settingService.getValue('min_transaction_for_points'),
      10,
    );

    let pointsEarned = 0;
    if (customer && total >= minTransactionForPoints) {
      pointsEarned = Math.floor(total / pointsAmountPerUnit) * pointsUnitValue;
    }

    let transaction!: ITransaction;

    await this.em.transactional(async (tem) => {
      transaction = tem.create(Transaction, {
        customer: customer ?? null,
        cashier,
        barber,
        subtotal: subtotal.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        total: total.toFixed(2),
        totalServiceAmount: totalServiceAmount.toFixed(2),
        totalProductAmount: totalProductAmount.toFixed(2),
        serviceCommissionRate: serviceCommissionRate.toFixed(2),
        productCommissionRate: productCommissionRate.toFixed(2),
        serviceCommissionAmount: serviceCommissionAmount.toFixed(2),
        productCommissionAmount: productCommissionAmount.toFixed(2),
        totalCommissionAmount: totalCommissionAmount.toFixed(2),
        pointsEarned,
        pointsUsed: voucherRedemption
          ? voucherRedemption.voucher.pointsRequired
          : 0,
        amountPaid: amountPaid.toFixed(2),
        changeAmount: changeAmount.toFixed(2),
        paymentMethod: 'cash',
        status: 'completed',
        paidAt: new Date(),
      });

      for (const item of transactionItems) {
        tem.create(TransactionItem, {
          transaction,
          itemType: item.itemType,
          itemId: item.itemId,
          itemName: item.itemName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        });

        if (item.itemType === ItemType.PRODUCT) {
          const product = await this.productRepository.findById(item.itemId);
          if (product) {
            product.stock -= item.quantity;
            tem.create(StockLog, {
              product,
              qtyChange: -item.quantity,
              type: 'transaction',
              referenceId: transaction.id,
              note: null,
            });
          }
        }
      }

      if (customer) {
        if (pointsEarned > 0) {
          customer.totalPoints += pointsEarned;
          tem.create(PointLog, {
            customer,
            transaction,
            pointChanges: pointsEarned,
            type: 'earn',
            note: 'Points earned from transaction',
          });
        }

        customer.lastTransactionAt = new Date();
        customer.pointsExpiryStartedAt = null;
        customer.pointsExpiredAt = null;
      }

      if (voucherRedemption) {
        voucherRedemption.isUsed = true;
        voucherRedemption.usedAt = new Date();
        voucherRedemption.transaction = transaction;
      }
    });

    // WA notification — outside transaction boundary, failure must not rollback
    // TODO: integrate Notifications module

    return transaction;
  }

  async findAll(
    filterDto: FilterTransactionDto,
  ): Promise<PaginatedResult<ITransaction>> {
    const { status, barberId, customerId, ...paginationQuery } = filterDto;

    const filters: Record<string, unknown> = {};
    if (status) filters.status = status;
    if (barberId) filters.barber = barberId;
    if (customerId) filters.customer = customerId;

    return paginate<ITransaction>(this.transactionRepository, paginationQuery, {
      filters,
      orderBy: { createdAt: 'DESC' },
      populate: ['customer', 'barber', 'cashier'] as const,
    });
  }

  async findById(id: string): Promise<ITransaction> {
    const transaction = await this.transactionRepository.findByIdWithItems(id);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }
}
