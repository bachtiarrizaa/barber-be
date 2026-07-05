import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Product } from '../../modules/products/entities/product.entity';

export class ProductSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const products = [
      {
        name: 'Pomade Strong Hold',
        description: 'Water-based pomade with a strong hold and high shine.',
        price: '75000',
        stock: 50,
        isActive: true,
      },
      {
        name: 'Hair Wax Matte',
        description: 'Matte finish hair wax with medium hold for natural styling.',
        price: '85000',
        stock: 30,
        isActive: true,
      },
      {
        name: 'Beard Oil Premium',
        description: 'Nourishing oil for soft, healthy, and well-groomed beard.',
        price: '120000',
        stock: 20,
        isActive: true,
      },
      {
        name: 'Shaving Cream Smooth',
        description: 'Rich lather shaving cream for a close and comfortable shave.',
        price: '45000',
        stock: 15,
        isActive: true,
      },
    ];

    for (const productData of products) {
      const exists = await em.findOne(Product, { name: productData.name });
      if (!exists) {
        em.create(Product, productData);
      }
    }

    await em.flush();
  }
}
