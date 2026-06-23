import { defineEntity, InferEntity, p } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from './transaction.entity';
import { ItemType } from '../enums/item-type.enum';

export const TransactionItem = defineEntity({
  name: 'TransactionItem',
  tableName: 'transaction_items',
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => uuidv4()),
    transaction: () => p.manyToOne(Transaction).hidden(),
    itemType: p.enum(() => ItemType),
    itemId: p.uuid().nullable(),
    itemName: p.string(),
    price: p.decimal().columnType('decimal(10,2)'),
    quantity: p.integer(),
    subtotal: p.decimal().columnType('decimal(10,2)'),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export type ITransactionItem = InferEntity<typeof TransactionItem>;
