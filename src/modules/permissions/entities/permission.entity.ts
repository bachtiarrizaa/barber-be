import { defineEntity, InferEntity, p } from '@mikro-orm/core';
import { PermissionRepository } from '../repositories/permission.repositoy';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../../roles/entities/role.entity';

export const Permission = defineEntity({
  name: 'Permission',
  tableName: 'permissions',
  repository: () => PermissionRepository,
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => uuidv4()),
    name: p.string(),
    actionCode: p.string().nullable().unique(),
    description: p.text().nullable(),
    parent: () => p.manyToOne(Permission).nullable(),
    children: () => p.oneToMany(Permission).mappedBy('parent'),
    roles: () => p.manyToMany(Role).mappedBy('permissions'),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export type IPermission = InferEntity<typeof Permission>;
