import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  Injectable,
  Logger,
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
import { XenditService } from '../../xendit/services/xendit.service';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

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
    private readonly xenditService: XenditService,
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
        {
          id: createTransationDto.voucherRedemptionId,
          customer: customer.id,
        },
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

    discountAmount = Math.min(discountAmount, subtotal);

    const total = subtotal - discountAmount;

    const treatmentCommissionRate = parseFloat(barber.treatmentCommission);
    const productCommissionRate = parseFloat(barber.productCommission);
    const treatmentCommissionAmount =
      totalTreatmentAmount * (treatmentCommissionRate / 100);
    const productCommissionAmount =
      totalProductAmount * (productCommissionRate / 100);
    const totalCommissionAmount =
      treatmentCommissionAmount + productCommissionAmount;

    const baseParams = {
      cashier,
      barber,
      customer,
      transactionItems,
      subtotal,
      discountAmount,
      total,
      totalTreatmentAmount: totalTreatmentAmount,
      totalProductAmount,
      treatmentCommissionRate,
      productCommissionRate,
      treatmentCommissionAmount,
      productCommissionAmount,
      totalCommissionAmount,
      voucherRedemption,
    };

    if (createTransationDto.paymentMethod === 'cash') {
      const amountPaid = createTransationDto.amountPaid ?? 0;
      if (amountPaid < total) {
        throw new BadRequestException(
          `Amount paid (${amountPaid}) is less than total (${total.toFixed(2)})`,
        );
      }
      const changeAmount = amountPaid - total;

      return this.finalizeTransaction({
        ...baseParams,
        paymentMethod: 'cash',
        amountPaid,
        changeAmount,
      });
    }

    // Non-cash path — create Xendit invoice, status = pending_payment
    return this.createPendingTransaction({
      ...baseParams,
      paymentMethod: createTransationDto.paymentMethod,
    });
  }

  private async createPendingTransaction(
    params: Omit<FinalizeTransactionParams, 'amountPaid' | 'changeAmount'>,
  ): Promise<ITransaction> {
    const {
      cashier,
      barber,
      customer,
      transactionItems,
      subtotal,
      discountAmount,
      total,
      totalTreatmentAmount,
      totalProductAmount,
      treatmentCommissionRate,
      productCommissionRate,
      treatmentCommissionAmount,
      productCommissionAmount,
      totalCommissionAmount,
      voucherRedemption,
      paymentMethod,
    } = params;

    let transaction!: ITransaction;

    await this.em.transactional((tem) => {
      transaction = tem.create(Transaction, {
        customer: customer ?? null,
        cashier,
        barber,
        subtotal: subtotal.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        total: total.toFixed(2),
        totalTreatmentAmount: totalTreatmentAmount.toFixed(2),
        totalProductAmount: totalProductAmount.toFixed(2),
        treatmentCommissionRate: treatmentCommissionRate.toFixed(2),
        productCommissionRate: productCommissionRate.toFixed(2),
        treatmentCommissionAmount: treatmentCommissionAmount.toFixed(2),
        productCommissionAmount: productCommissionAmount.toFixed(2),
        totalCommissionAmount: totalCommissionAmount.toFixed(2),
        pointsEarned: 0,
        pointsUsed: voucherRedemption
          ? voucherRedemption.voucher.pointsRequired
          : 0,
        amountPaid: '0.00',
        changeAmount: '0.00',
        paymentMethod,
        status: 'pending_payment',
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
      }
    });

    // Create Xendit invoice AFTER transaction saved — so we have transaction.id as externalId
    const invoice = await this.xenditService.createInvoice({
      externalId: transaction.id,
      amount: Math.round(total),
      payerEmail: customer?.phone
        ? `${customer.phone}@barbershop.local`
        : undefined,
      description: `Payment for transaction ${transaction.id}`,
    });

    transaction.xenditInvoiceId = invoice.invoiceId;
    transaction.paymentUrl = invoice.invoiceUrl;
    await this.em.flush();

    await this.em.populate(transaction, ['items']);
    return transaction;
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

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product '${product.name}'. Available: ${product.stock}, requested: ${item.quantity}`,
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
      totalTreatmentAmount,
      totalProductAmount,
      treatmentCommissionRate,
      productCommissionRate,
      treatmentCommissionAmount,
      productCommissionAmount,
      totalCommissionAmount,
      amountPaid,
      changeAmount,
      voucherRedemption,
      paymentMethod,
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
        totalTreatmentAmount: totalTreatmentAmount.toFixed(2),
        totalProductAmount: totalProductAmount.toFixed(2),
        treatmentCommissionRate: treatmentCommissionRate.toFixed(2),
        productCommissionRate: productCommissionRate.toFixed(2),
        treatmentCommissionAmount: treatmentCommissionAmount.toFixed(2),
        productCommissionAmount: productCommissionAmount.toFixed(2),
        totalCommissionAmount: totalCommissionAmount.toFixed(2),
        pointsEarned,
        pointsUsed: voucherRedemption
          ? voucherRedemption.voucher.pointsRequired
          : 0,
        amountPaid: amountPaid.toFixed(2),
        changeAmount: changeAmount.toFixed(2),
        paymentMethod,
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
            if (product.stock < item.quantity) {
              this.logger.warn(
                `Stock anomaly: product ${product.id} ('${product.name}') insufficient at finalize. Available: ${product.stock}, needed: ${item.quantity}. Transaction proceeds as completed regardless.`,
              );
            }
            product.stock -= item.quantity;
            tem.create(StockLog, {
              product,
              qtyChange: -item.quantity,
              type: 'transaction',
              referenceId: transaction.id,
              note:
                product.stock < 0
                  ? 'ANOMALY: oversold, needs manual restock/refund decision'
                  : null,
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

    await this.em.populate(transaction, ['items']);
    return transaction;
  }

  async finalizeFromWebhook(
    xenditInvoiceId: string,
    paidAmount?: number,
  ): Promise<ITransaction> {
    const transaction = await this.transactionRepository.findOne(
      { xenditInvoiceId },
      { populate: ['items', 'customer', 'barber', 'cashier'] as const },
    );

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with invoice ${xenditInvoiceId} not found`,
      );
    }

    if (transaction.status !== 'pending_payment') {
      // idempotent — already processed, do nothing
      return transaction;
    }

    const expectedTotal = parseFloat(transaction.total);
    if (
      paidAmount !== undefined &&
      Math.round(paidAmount) !== Math.round(expectedTotal)
    ) {
      this.logger.warn(
        `Payment amount mismatch for transaction ${transaction.id}. Expected: ${expectedTotal}, received from webhook: ${paidAmount}. Proceeding as paid regardless — flagged for review.`,
      );
    }

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

    const total = parseFloat(transaction.total);
    let pointsEarned = 0;
    if (transaction.customer && total >= minTransactionForPoints) {
      pointsEarned = Math.floor(total / pointsAmountPerUnit) * pointsUnitValue;
    }

    await this.em.transactional(async (tem) => {
      transaction.status = 'completed';
      transaction.paidAt = new Date();
      transaction.amountPaid = transaction.total;
      transaction.changeAmount = '0.00';
      transaction.pointsEarned = pointsEarned;

      for (const item of transaction.items.getItems()) {
        if (item.itemType === ItemType.PRODUCT && item.itemId) {
          const product = await this.productRepository.findById(item.itemId);
          if (product) {
            if (product.stock < item.quantity) {
              throw new BadRequestException(
                `Insufficient stock for product at finalization. Available: ${product.stock}, requested: ${item.quantity}`,
              );
            }

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

      if (transaction.customer) {
        if (pointsEarned > 0) {
          transaction.customer.totalPoints += pointsEarned;
          tem.create(PointLog, {
            customer: transaction.customer,
            transaction,
            pointChanges: pointsEarned,
            type: 'earn',
            note: 'Points earned from transaction',
          });
        }

        transaction.customer.lastTransactionAt = new Date();
        transaction.customer.pointsExpiryStartedAt = null;
        transaction.customer.pointsExpiredAt = null;
      }

      // mark voucher redemption used, if any, by checking redemption linked to this transaction
      const redemption = await this.voucherRedemptionRepository.findOne({
        transaction: transaction.id,
      });
      if (redemption && !redemption.isUsed) {
        redemption.isUsed = true;
        redemption.usedAt = new Date();
      }
    });

    // WA notification — outside transaction boundary
    // TODO: integrate Notifications module

    return transaction;
  }

  async expireFromWebhook(xenditInvoiceId: string): Promise<ITransaction> {
    const transaction = await this.transactionRepository.findOne({
      xenditInvoiceId,
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with invoice ${xenditInvoiceId} not found`,
      );
    }

    if (transaction.status !== 'pending_payment') {
      return transaction;
    }

    await this.em.transactional(async () => {
      transaction.status = 'expired';

      const redemption = await this.voucherRedemptionRepository.findOne({
        transaction: transaction.id,
      });
      if (redemption) {
        redemption.isUsed = false;
        redemption.usedAt = null;
      }
    });

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

  async cancel(id: string): Promise<ITransaction> {
    const transaction = await this.transactionRepository.findOne({ id });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== 'pending_payment') {
      throw new BadRequestException(
        'Only pending_payment transactions can be cancelled',
      );
    }

    if (transaction.xenditInvoiceId) {
      try {
        await this.xenditService.expireInvoice(transaction.xenditInvoiceId);
      } catch (error) {
        this.logger.error(
          `Failed to expire Xendit invoice ${transaction.xenditInvoiceId}:`,
          error,
        );
      }
    }

    await this.em.transactional(async () => {
      transaction.status = 'cancelled';

      if (transaction.customer) {
        const redemption = await this.voucherRedemptionRepository.findOne({
          transaction: transaction.id,
        });
        if (redemption) {
          redemption.isUsed = false;
          redemption.usedAt = null;
        }
      }
    });

    return transaction;
  }
}
