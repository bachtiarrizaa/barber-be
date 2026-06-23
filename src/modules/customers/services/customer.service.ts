import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Customer, ICustomer } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { CustomerRepository } from '../repositories/customer.repository';
import { FilterCustomerDto } from '../dtos/filter-customer.dto';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';
import { IPointLog, PointLog } from '../entities/point-log.entity';
import { PointLogRepository } from '../repositories/point-log.repository';
import {
  IVoucherRedemption,
  VoucherRedemption,
} from '../../vouchers/entities/voucher-redemption.entity';
import { VoucherRedemptionRepository } from '../../vouchers/repositories/voucher-redemption.repository';
import { RedeemVoucherDto } from '../../vouchers/dtos/reedem-voucher.dto';
import { Voucher } from '../../vouchers/entities/voucher.entity';
import { VoucherRepository } from '../../vouchers/repositories/voucher.repository';
import { SettingService } from '../../settings/services/setting.service';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(PointLog)
    private readonly pointLogRepository: PointLogRepository,
    @InjectRepository(VoucherRedemption)
    private readonly voucherRedemptionRepository: VoucherRedemptionRepository,
    @InjectRepository(Customer)
    private readonly customerRespository: CustomerRepository,
    @InjectRepository(Voucher)
    private readonly voucherRepository: VoucherRepository,
    private readonly settingService: SettingService,
    private readonly em: EntityManager,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<ICustomer> {
    const existPhone = await this.customerRespository.findByPhone(
      createCustomerDto.phone,
    );
    if (existPhone) {
      throw new ConflictException('Phone number already exist');
    }

    const customer = this.customerRespository.create({
      name: createCustomerDto.name,
      phone: createCustomerDto.phone,
      address: createCustomerDto.address ?? null,
    });

    await this.em.flush();
    return customer;
  }

  async findAll(
    filterDto: FilterCustomerDto,
  ): Promise<PaginatedResult<ICustomer>> {
    const { ...paginationQuery } = filterDto;

    return paginate<ICustomer>(this.customerRespository, paginationQuery, {
      searchFields: ['name', 'phone'],
      orderBy: { createdAt: 'DESC' },
    });
  }

  async findById(customerId: string): Promise<ICustomer> {
    const customer = await this.customerRespository.findById(customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async update(
    customerId: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<ICustomer> {
    const customer = await this.findById(customerId);

    if (updateCustomerDto.phone && updateCustomerDto.phone !== customer.phone) {
      const existPhone = await this.customerRespository.findByPhone(
        updateCustomerDto.phone,
      );
      if (existPhone) {
        throw new ConflictException('Customer with this phone already exist');
      }
    }

    this.em.assign(customer, updateCustomerDto);
    await this.em.flush();
    return customer;
  }

  async delete(customerId: string): Promise<void> {
    const customer = await this.findById(customerId);
    await this.em.remove(customer).flush();
  }

  async getPointLogs(customerId: string): Promise<IPointLog[]> {
    await this.findById(customerId);
    return this.pointLogRepository.findByCustomer(customerId);
  }

  async getVouchersCustomer(customerId: string): Promise<IVoucherRedemption[]> {
    await this.findById(customerId);
    return this.voucherRedemptionRepository.findActiveByCustomer(customerId);
  }

  async redeemVoucher(
    customerId: string,
    reedemVoucherDto: RedeemVoucherDto,
  ): Promise<IVoucherRedemption> {
    const customer = await this.findById(customerId);

    const voucher = await this.voucherRepository.findActiveVoucher(
      reedemVoucherDto.voucherId,
    );

    if (!voucher) {
      throw new NotFoundException('Voucher not found or inactive');
    }

    const existingRedemption =
      await this.voucherRedemptionRepository.findUnusedVoucher(
        customerId,
        reedemVoucherDto.voucherId,
      );

    if (existingRedemption) {
      throw new ConflictException(
        'You have already redeemed this voucher and it is still unused.',
      );
    }
    if (voucher.pointsRequired > customer.totalPoints) {
      throw new BadRequestException(
        `Insufficient points. Required: ${voucher.pointsRequired}, available: ${customer.totalPoints}`,
      );
    }

    // const expiryDays = 30;
    const expiryDays = parseInt(
      await this.settingService.getValue('voucher_expiry_days'),
      10,
    );
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + expiryDays);

    let redemption!: IVoucherRedemption;

    await this.em.transactional((tem) => {
      customer.totalPoints -= voucher.pointsRequired;

      tem.create(PointLog, {
        customer,
        pointChanges: -voucher.pointsRequired,
        type: 'redeem',
        note: `Redeem voucher: ${voucher.name}`,
      });

      redemption = tem.create(VoucherRedemption, {
        customer,
        voucher,
        isUsed: false,
        expiredAt,
      });
    });

    return redemption;
  }
}
