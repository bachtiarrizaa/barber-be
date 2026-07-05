import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Customer } from '../../modules/customers/entities/customer.entity';

export class CustomerSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const customers = [
      {
        name: 'Budi Santoso',
        phone: '081234567890',
        address: 'Jl. Merdeka No. 10, Jakarta',
        totalPoints: 100,
      },
      {
        name: 'Ani Lestari',
        phone: '082345678901',
        address: 'Jl. Sudirman No. 25, Bandung',
        totalPoints: 250,
      },
      {
        name: 'Candra Wijaya',
        phone: '083456789012',
        address: 'Jl. Diponegoro No. 8, Surabaya',
        totalPoints: 0,
      },
    ];

    for (const customerData of customers) {
      const exists = await em.findOne(Customer, { phone: customerData.phone });
      if (!exists) {
        em.create(Customer, customerData);
      }
    }

    await em.flush();
  }
}
