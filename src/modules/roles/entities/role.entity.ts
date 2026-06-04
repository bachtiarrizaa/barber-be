import { defineEntity, InferEntity, p } from '@mikro-orm/core';
import { RoleRepository } from '../repositories/role.repository';
import { v4 as uuidv4 } from 'uuid';

export const Role = defineEntity({
  name: 'Role',
  tableName: 'roles',
  repository: () => RoleRepository,
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => uuidv4()),
    name: p.string(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export type IRole = InferEntity<typeof Role>;
