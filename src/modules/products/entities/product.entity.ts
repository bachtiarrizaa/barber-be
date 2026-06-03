import { defineEntity, InferEntity, p } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { ProductRepository } from '../repositories/product.repository';

export const Product = defineEntity({
  name: 'Product',
  tableName: 'products',
  repository: () => ProductRepository,
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => uuidv4()),
    name: p.string(),
    description: p.text().nullable(),
    image: p.string().nullable(),
    price: p.decimal().columnType('decimal(10, 2)'),
    stock: p.integer().default(0),
    isActive: p.boolean().default(true),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export type IProduct = InferEntity<typeof Product>;
