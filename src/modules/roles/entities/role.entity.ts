import { defineEntity, InferEntity, p } from '@mikro-orm/core';
import { RoleRepository } from '../repositories/role.repository';
import { v4 as uuidv4 } from 'uuid';
import { Permission } from '../../permissions/entities/permission.entity';

export const Role = defineEntity({
  name: 'Role',
  tableName: 'roles',
  repository: () => RoleRepository,
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => uuidv4()),
    name: p.string().unique(),
    permissions: () => p.manyToMany(Permission).pivotTable('role_permissions'),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export type IRole = InferEntity<typeof Role>;
