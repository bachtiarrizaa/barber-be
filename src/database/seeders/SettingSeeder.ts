import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Setting } from '../../modules/settings/entities/setting.entity';

const defaultSettings = [
  {
    key: 'points_amount_per_unit',
    value: '10000',
  },
  {
    key: 'points_unit_value',
    value: '1',
  },
  {
    key: 'voucher_expiry_days',
    value: '30',
  },
  {
    key: 'points_expiry_inactive_months',
    value: '6',
  },
  {
    key: 'points_expiry_countdown_months',
    value: '3',
  },
  {
    key: 'min_transaction_for_points',
    value: '0',
  },
  {
    key: 'wa_notification_enabled',
    value: 'true',
  },
  {
    key: 'report_timezone',
    value: 'Asia/Jakarta',
  },
  {
    key: 'shop_name',
    value: 'My Barbershop',
  },
  {
    key: 'shop_phone',
    value: '',
  },
  { key: 'shop_address', value: '', description: 'Optional shop address' },
];

export class SettingSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (const s of defaultSettings) {
      const exists = await em.findOne(Setting, { key: s.key });
      if (!exists) {
        em.create(Setting, s);
      }
    }
    await em.flush();
  }
}
