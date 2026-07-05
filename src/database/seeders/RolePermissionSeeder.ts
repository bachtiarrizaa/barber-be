import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import { Role } from '../../modules/roles/entities/role.entity';

const rolePermissionMap: Record<string, string[] | 'all'> = {
  admin: 'all',
  cashier: [
    'dashboard:read',
    'products:read',
    'treatments:read',
    'vouchers:read',
    'customers:read',
    'customers:create',
    'customers:update',
    'transactions:read',
    'transactions:create',
    'transactions:cancel',
    'attendance:read',
    'attendance:manage',
    'attendances:check-in',
    'attendances:check-out',
    'users:read',
  ],
  barber: ['transactions:read', 'attendance:read'],
};

export class RolePermissionSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const allPermissions = await em.find(Permission, {
      actionCode: { $ne: null },
    });
    const permissionMap = new Map(
      allPermissions.map((p) => [p.actionCode!, p]),
    );

    for (const [roleName, actionCodes] of Object.entries(rolePermissionMap)) {
      const role = await em.findOne(
        Role,
        { name: roleName },
        { populate: ['permissions'] },
      );
      if (!role) {
        console.warn(
          `[RolePermissionSeeder] Role '${roleName}' tidak ditemukan, skip.`,
        );
        continue;
      }

      const targets =
        actionCodes === 'all'
          ? allPermissions
          : (actionCodes
              .map((code) => permissionMap.get(code))
              .filter(Boolean) as typeof allPermissions);

      for (const permission of targets) {
        if (!role.permissions.contains(permission)) {
          role.permissions.add(permission);
        }
      }
    }

    await em.flush();
  }
}
