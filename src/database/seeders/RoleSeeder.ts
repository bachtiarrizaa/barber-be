import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Role } from '../../modules/roles/entities/role.entity';

export class RoleSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const roles = ['admin', 'cashier', 'barber'];

    for (const name of roles) {
      const exists = await em.findOne(Role, { name });
      if (!exists) {
        em.create(Role, { name });
      }
    }

    await em.flush();
  }
}
