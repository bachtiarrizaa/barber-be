import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { RoleSeeder } from './RoleSeeder';
import { UserSeeder } from './UserSeeder';
import { PermissionSeeder } from './PermissionSeeder';
import { RolePermissionSeeder } from './RolePermissionSeeder';
import { SettingSeeder } from './SettingSeeder';
import { CustomerSeeder } from './CustomerSeeder';
import { ProductSeeder } from './ProductSeeder';
import { TreatmentSeeder } from './TreatmentSeeder';
import { VoucherSeeder } from './VoucherSeeder';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    return this.call(em, [
      RoleSeeder,
      PermissionSeeder,
      RolePermissionSeeder,
      UserSeeder,
      SettingSeeder,
      CustomerSeeder,
      ProductSeeder,
      TreatmentSeeder,
      VoucherSeeder,
    ]);
  }
}
