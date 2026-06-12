import { defineEntity, InferEntity, p } from '@mikro-orm/core';
import { CustomerRepository } from '../repositories/customer.repository';
import { v4 as uuidv4 } from 'uuid';

export const Customer = defineEntity({
  name: 'Customer',
  tableName: 'customers',
  repository: () => CustomerRepository,
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => uuidv4()),
    name: p.string(),
    phone: p.string().unique(),
    address: p.text().nullable(),
    totalPoints: p.integer().default(0),
    lastTransactionAt: p.datetime().nullable(),
    pointsExpiryStartedAt: p.datetime().nullable(),
    pointsExpiredAt: p.datetime().nullable(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export type ICustomer = InferEntity<typeof Customer>;
