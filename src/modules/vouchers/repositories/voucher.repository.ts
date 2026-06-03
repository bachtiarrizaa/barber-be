import { EntityRepository } from '@mikro-orm/postgresql';
import { IVoucher } from '../entities/voucher.entity';

export class VoucherRepository extends EntityRepository<IVoucher> {}
