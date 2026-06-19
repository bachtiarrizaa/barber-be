import { defineEntity, InferEntity, p } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from './transaction.entity';

export const TransactionItem = defineEntity({
  name: 'TransactionItem',
  tableName: 'transaction_items',
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => uuidv4()),
    transaction: () => p.manyToOne(Transaction),
    itemType: p.string(),
    itemId: p.uuid().nullable(),
    itemName: p.string(),
    price: p.decimal().columnType('decimal(10,2)'),
    qty: p.integer(),
    subtotal: p.decimal().columnType('decimal(10,2)'),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export type ITransactionItem = InferEntity<typeof TransactionItem>;
