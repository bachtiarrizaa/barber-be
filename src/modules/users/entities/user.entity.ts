import { defineEntity, InferEntity, p } from '@mikro-orm/core';
import { UserRepository } from '../repositories/user.repository';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../../roles/entities/role.entity';

export const User = defineEntity({
  name: 'User',
  tableName: 'users',
  repository: () => UserRepository,
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => uuidv4()),
    name: p.string(),
    email: p.string().unique(),
    password: p.string(),
    role: () => p.manyToOne(Role),
    treatmentCommission: p.decimal().columnType('decimal(5,2)'),
    productCommission: p.decimal().columnType('decimal(5,2)'),
    isActive: p.boolean().default(true),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export type IUser = InferEntity<typeof User>;
