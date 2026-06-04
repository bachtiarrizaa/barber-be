import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Role } from '../../modules/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';

export class UserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const adminRole = await em.findOneOrFail(Role, { name: 'admin' });
    const cashierRole = await em.findOneOrFail(Role, { name: 'cashier' });
    const barberRole = await em.findOneOrFail(Role, { name: 'barber' });

    const password = await bcrypt.hash('password123', 10);

    const users = [
      {
        name: 'admin',
        email: 'admin@gmail.com',
        password,
        role: adminRole,
        treatmentCommission: '0',
        productCommission: '0',
        isActive: true,
      },
      {
        name: 'cashier',
        email: 'cashier@gmail.com',
        password,
        role: cashierRole,
        treatmentCommission: '0',
        productCommission: '0',
        isActive: true,
      },
      {
        name: 'Barber',
        email: 'barber@gmail.com',
        password,
        role: barberRole,
        treatmentCommission: '40',
        productCommission: '30',
        isActive: true,
      },
    ];

    for (const userData of users) {
      const exists = await em.findOne(User, { email: userData.email });
      if (!exists) {
        em.create(User, userData);
      }
    }

    await em.flush();
  }
}
