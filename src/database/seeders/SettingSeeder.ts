import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Setting } from '../../modules/settings/entities/setting.entity';

const defaultSettings = [
  {
    name: 'Points Amount Per Unit',
    key: 'points_amount_per_unit',
    value: '10000',
    description: 'Nominal rupiah per 1 poin',
    isSystem: true,
  },
  {
    name: 'Points Unit Value',
    key: 'points_unit_value',
    value: '1',
    description: 'Jumlah poin yang didapat per unit',
    isSystem: true,
  },
  {
    name: 'Voucher Expiry Days',
    key: 'voucher_expiry_days',
    value: '30',
    description: 'Masa berlaku voucher dalam hari',
    isSystem: true,
  },
  {
    name: 'Points Expiry Inactive Months',
    key: 'points_expiry_inactive_months',
    value: '6',
    description: 'Bulan tidak aktif sebelum poin expired',
    isSystem: true,
  },
  {
    name: 'Points Expiry Countdown Months',
    key: 'points_expiry_countdown_months',
    value: '3',
    description: 'Bulan countdown sebelum poin expired',
    isSystem: true,
  },
  {
    name: 'Min Transaction For Points',
    key: 'min_transaction_for_points',
    value: '0',
    description: 'Minimal transaksi untuk mendapatkan poin',
    isSystem: true,
  },
  {
    name: 'WA Notification Enabled',
    key: 'wa_notification_enabled',
    value: 'true',
    description: 'Aktifkan notifikasi WhatsApp',
    isSystem: true,
  },
  {
    name: 'Report Timezone',
    key: 'report_timezone',
    value: 'Asia/Jakarta',
    description: 'Timezone untuk laporan',
    isSystem: true,
  },
  {
    name: 'Shop Name',
    key: 'shop_name',
    value: 'My Barbershop',
    description: 'Nama toko barbershop',
    isSystem: true,
  },
  {
    name: 'Shop Phone',
    key: 'shop_phone',
    value: '',
    description: 'Nomor telepon toko',
    isSystem: true,
  },
  {
    name: 'Shop Address',
    key: 'shop_address',
    value: '',
    description: 'Alamat toko barbershop',
    isSystem: true,
  },
];

export class SettingSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (const s of defaultSettings) {
      const exists = await em.findOne(Setting, { key: s.key });
      if (!exists) {
        em.create(Setting, s);
      } else {
        // Update name, description, and isSystem for existing entries
        em.assign(exists, {
          name: s.name,
          description: s.description,
          isSystem: s.isSystem,
        });
      }
    }
    await em.flush();
  }
}
