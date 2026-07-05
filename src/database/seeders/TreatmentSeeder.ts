import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Treatment } from '../../modules/treatments/entities/treatment.entity';

export class TreatmentSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const treatments = [
      {
        name: 'Haircut & Wash',
        description: 'Standard hair cutting, washing, and warm towel massage.',
        price: '50000',
        isActive: true,
      },
      {
        name: 'Hair Styling & Blow',
        description: 'Hair wash followed by styling and professional blow dry.',
        price: '35000',
        isActive: true,
      },
      {
        name: 'Shaving & Hot Towel',
        description: 'Clean beard/mustache shave with hot towel preparation.',
        price: '30000',
        isActive: true,
      },
      {
        name: 'Hair Coloring Basic',
        description: 'Full hair coloring using basic colors.',
        price: '150000',
        isActive: true,
      },
    ];

    for (const treatmentData of treatments) {
      const exists = await em.findOne(Treatment, { name: treatmentData.name });
      if (!exists) {
        em.create(Treatment, treatmentData);
      }
    }

    await em.flush();
  }
}
