import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Voucher } from '../../modules/vouchers/entities/voucher.entity';

export class VoucherSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const vouchers = [
      {
        name: 'Diskon 10%',
        description: 'Potongan harga 10% untuk semua transaksi.',
        pointsRequired: 50,
        type: 'percent' as const,
        value: '10',
        isActive: true,
      },
      {
        name: 'Potongan 20 Ribu',
        description: 'Potongan harga langsung sebesar Rp 20.000.',
        pointsRequired: 80,
        type: 'rupiah' as const,
        value: '20000',
        isActive: true,
      },
      {
        name: 'Diskon 25% Premium',
        description: 'Potongan harga 25% untuk transaksi layanan/produk.',
        pointsRequired: 150,
        type: 'percent' as const,
        value: '25',
        isActive: true,
      },
      {
        name: 'Potongan 50 Ribu',
        description: 'Potongan harga langsung sebesar Rp 50.000.',
        pointsRequired: 200,
        type: 'rupiah' as const,
        value: '50000',
        isActive: true,
      },
    ];

    for (const voucherData of vouchers) {
      const exists = await em.findOne(Voucher, { name: voucherData.name });
      if (!exists) {
        em.create(Voucher, voucherData);
      }
    }

    await em.flush();
  }
}
