import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { RoleSeeder } from './RoleSeeder';
import { UserSeeder } from './UserSeeder';
import { PermissionSeeder } from './PermissionSeeder';
import { RolePermissionSeeder } from './RolePermissionSeeder';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    return this.call(em, [
      RoleSeeder,
      PermissionSeeder,
      RolePermissionSeeder,
      UserSeeder,
    ]);
  }
}
