import { defineEntity, InferEntity, p } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { SettingRepository } from '../repositories/setting.repository';

export const Setting = defineEntity({
  name: 'Setting',
  tableName: 'settings',
  repository: () => SettingRepository,
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => uuidv4()),
    name: p.string(),
    key: p.string().unique(),
    value: p.string(),
    description: p.string().nullable(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export type ISetting = InferEntity<typeof Setting>;
