import { EntityRepository } from '@mikro-orm/postgresql';
import { IVoucher } from '../entities/voucher.entity';

export class VoucherRepository extends EntityRepository<IVoucher> {
  async findByName(name: string): Promise<IVoucher | null> {
    return this.findOne({ name });
  }

  async findActiveVoucher(voucherId: string): Promise<IVoucher | null> {
    return this.findOne({
      id: voucherId,
      isActive: true,
    });
  }
}
