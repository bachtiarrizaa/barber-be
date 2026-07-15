import { defineEntity, InferEntity, p } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { TransactionRepository } from '../repositories/transaction.repository';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { TransactionItem } from './transaction-item.entity';

export const Transaction = defineEntity({
  name: 'Transaction',
  tableName: 'transactions',
  repository: () => TransactionRepository,
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => uuidv4()),
    customer: () => p.manyToOne(Customer).nullable(),
    cashier: () => p.manyToOne(User),
    barber: () => p.manyToOne(User),
    subtotal: p.decimal().columnType('decimal(10,2)'),
    discountAmount: p.decimal().columnType('decimal(10,2)').default('0'),
    total: p.decimal().columnType('decimal(10,2)'),
    totalServiceAmount: p.decimal().columnType('decimal(10,2)'),
    totalProductAmount: p.decimal().columnType('decimal(10,2)'),
    serviceCommissionRate: p.decimal().columnType('decimal(5,2)'),
    productCommissionRate: p.decimal().columnType('decimal(5,2)'),
    serviceCommissionAmount: p.decimal().columnType('decimal(10,2)'),
    productCommissionAmount: p.decimal().columnType('decimal(10,2)'),
    totalCommissionAmount: p.decimal().columnType('decimal(10,2)'),
    pointsEarned: p.integer().default(0),
    pointsUsed: p.integer().default(0),
    paymentMethod: p.string(),
    amountPaid: p.decimal().columnType('decimal(10,2)').default('0'),
    changeAmount: p.decimal().columnType('decimal(10,2)').default('0'),
    xenditInvoiceId: p.string().nullable().unique(),
    paymentUrl: p.string().nullable(),
    paidAt: p.datetime().nullable(),
    status: p.string(),
    items: () => p.oneToMany(TransactionItem).mappedBy('transaction'),
    createdAt: p.datetime().onCreate(() => new Date()),

    period: p.string().nullable().persist(false),
  },
});

export type ITransaction = InferEntity<typeof Transaction>;
