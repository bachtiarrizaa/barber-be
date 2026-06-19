import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Setting } from '../../modules/settings/entities/setting.entity';

const defaultSettings = [
  {
    key: 'points_amount_per_unit',
    name: 'Poin Amount Per Unit',
    value: '10000',
    description: 'IDR per 1 point earned',
  },
  {
    key: 'points_unit_value',
    name: 'Poin Unit Value',
    value: '1',
    description: 'Points earned per unit amount',
  },
  {
    key: 'voucher_expiry_days',
    name: 'Voucher Expiry Days',
    value: '30',
    description: 'Days until voucher redemption expires',
  },
  {
    key: 'points_expiry_inactive_months',
    name: 'Poin Expiry Inactive Months',
    value: '6',
    description: 'Months of inactivity before countdown starts',
  },
  {
    key: 'points_expiry_countdown_months',
    name: 'Poin Expiry Countdown Months',
    value: '3',
    description: 'Months of countdown before points expire',
  },
  {
    key: 'min_transaction_for_points',
    name: 'Minimum Transaction For Points',
    value: '0',
    description: 'Minimum total IDR to earn points',
  },
  {
    key: 'wa_notification_enabled',
    name: 'WA Notification Enabled',
    value: 'true',
    description: 'Global toggle for WhatsApp notifications',
  },
  {
    key: 'report_timezone',
    name: 'Report Timezone',
    value: 'Asia/Jakarta',
    description: 'Timezone for reports and cron jobs',
  },
  {
    key: 'shop_name',
    name: 'Shop Name',
    value: 'My Barbershop',
    description: 'Used in WA templates and report headers',
  },
  {
    key: 'shop_phone',
    name: 'Shop Phone',
    value: '628983162389',
    description: 'Optional footer in WA notifications',
  },
  {
    key: 'shop_address',
    name: 'Shop Address',
    value: '',
    description: 'Optional shop address',
  },
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
