import { defineEntity, InferEntity, p } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../../products/entities/product.entity';
import { StockLogRepository } from '../repositories/stock-log.repository';

export const StockLog = defineEntity({
  name: 'StockLog',
  tableName: 'stock_logs',
  repository: () => StockLogRepository,
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => uuidv4()),
    product: () => p.manyToOne(Product),
    qtyChange: p.integer(),
    type: p.string(),
    referenceId: p.uuid().nullable(),
    note: p.text().nullable(),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export type IStockLog = InferEntity<typeof StockLog>;
