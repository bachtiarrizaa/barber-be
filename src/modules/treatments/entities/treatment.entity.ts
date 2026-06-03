import { defineEntity, InferEntity, p } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { TreatmentRepository } from '../repositories/treatment.repository';

export const Treatment = defineEntity({
  name: 'Treatment',
  tableName: 'treatments',
  repository: () => TreatmentRepository,
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => uuidv4()),
    name: p.string(),
    description: p.text().nullable(),
    image: p.string().nullable(),
    price: p.decimal().columnType('decimal(10, 2)'),
    isActive: p.boolean().default(true),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export type ITreatment = InferEntity<typeof Treatment>;
