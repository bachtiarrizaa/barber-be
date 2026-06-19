import { EntityRepository } from '@mikro-orm/postgresql';
import { ISetting } from '../entities/setting.entity';

export class SettingRepository extends EntityRepository<ISetting> {
  async findByKey(key: string): Promise<ISetting | null> {
    return this.findOne({ key });
  }

  async findByKeys(keys: string[]): Promise<ISetting[]> {
    return this.find({ key: { $in: keys } });
  }

  async findById(settingId: string): Promise<ISetting | null> {
    return this.findOne({ id: settingId });
  }
}
