import { defineEntity, InferEntity, p } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from '../../customers/entities/customer.entity';
import { Voucher } from './voucher.entity';
import { VoucherRedemptionRepository } from '../repositories/voucher-redemption.repository';
import { Transaction } from '../../transactions/entities/transaction.entity';

export const VoucherRedemption = defineEntity({
  name: 'VoucherRedemption',
  tableName: 'voucher_redemptions',
  repository: () => VoucherRedemptionRepository,
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => uuidv4()),
    customer: () => p.manyToOne(Customer),
    voucher: () => p.manyToOne(Voucher),
    transaction: () => p.manyToOne(Transaction).nullable(),
    isUsed: p.boolean().default(false),
    usedAt: p.datetime().nullable(),
    expiredAt: p.datetime(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export type IVoucherRedemption = InferEntity<typeof VoucherRedemption>;
