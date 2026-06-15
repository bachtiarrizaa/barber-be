import { EntityRepository } from '@mikro-orm/postgresql';
import { IVoucherRedemption } from '../entities/voucher-redemption.entity';

export class VoucherRedemptionRepository extends EntityRepository<IVoucherRedemption> {
  async findByCustomer(customerId: string): Promise<IVoucherRedemption[]> {
    return this.find(
      { customer: customerId },
      { populate: ['voucher'] as const, orderBy: { createdAt: 'DESC' } },
    );
  }

  async findActiveByCustomer(
    customerId: string,
  ): Promise<IVoucherRedemption[]> {
    return this.find(
      {
        customer: customerId,
        isUsed: false,
        expiredAt: { $gt: new Date() },
      },
      {
        populate: ['voucher'] as const,
        orderBy: { createdAt: 'DESC' },
      },
    );
  }

  async findByIdAndCustomer(
    id: string,
    customerId: string,
  ): Promise<IVoucherRedemption | null> {
    return this.findOne(
      { id, customer: customerId },
      { populate: ['voucher'] as const },
    );
  }

  async findUnusedVoucher(
    customerId: string,
    voucherId: string,
  ): Promise<IVoucherRedemption | null> {
    return this.findOne({
      customer: customerId,
      voucher: voucherId,
      isUsed: false,
    });
  }
}
