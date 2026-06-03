import { defineEntity, InferEntity, p } from '@mikro-orm/core';
import { VoucherRepository } from '../repositories/voucher.repository';
import { v4 as uuidv4 } from 'uuid';

export const Voucher = defineEntity({
  name: 'Voucher',
  tableName: 'vouchers',
  repository: () => VoucherRepository,
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => uuidv4()),
    name: p.string(),
    description: p.text().nullable(),
    pointsRequired: p.integer(),
    type: p.enum(['percent', 'rupiah']),
    value: p.decimal().columnType('decimal(10, 2)'),
    isActive: p.boolean().default(true),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export type IVoucher = InferEntity<typeof Voucher>;
