import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Setting, ISetting } from '../entities/setting.entity';
import { SettingRepository } from '../repositories/setting.repository';
import { EntityManager } from '@mikro-orm/postgresql';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: SettingRepository,
    private readonly em: EntityManager,
  ) {}

  async getValue(key: string): Promise<string> {
    const setting = await this.settingRepository.findByKey(key);
    if (!setting) {
      throw new NotFoundException(`Setting '${key}' not found`);
    }
    return setting.value;
  }

  async getValues(keys: string[]): Promise<Record<string, string>> {
    const settings = await this.settingRepository.findByKeys(keys);
    return Object.fromEntries(settings.map((s) => [s.key, s.value]));
  }

  async findAll(): Promise<ISetting[]> {
    return this.settingRepository.findAll({ orderBy: { key: 'ASC' } });
  }

  async update(key: string, value: string): Promise<ISetting> {
    const setting = await this.settingRepository.findByKey(key);
    if (!setting) {
      throw new NotFoundException(`Setting '${key}' not found`);
    }
    this.em.assign(setting, { value });
    await this.em.flush();
    return setting;
  }
}
