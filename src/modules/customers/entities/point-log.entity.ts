import { defineEntity, InferEntity, p } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from './customer.entity';
import { PointLogRepository } from '../repositories/point-log.repository';
import { Transaction } from '../../transactions/entities/transaction.entity';

export const PointLog = defineEntity({
  name: 'PointLog',
  tableName: 'point_logs',
  repository: () => PointLogRepository,
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => uuidv4()),
    customer: () => p.manyToOne(Customer),
    transaction: () => p.manyToOne(Transaction).nullable(),
    pointChanges: p.integer(),
    type: p.enum(['earn', 'redeem', 'expired', 'adjust']),
    note: p.text().nullable(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export type IPointLog = InferEntity<typeof PointLog>;
