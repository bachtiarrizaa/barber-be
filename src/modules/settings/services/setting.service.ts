import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Setting, ISetting } from '../entities/setting.entity';
import { SettingRepository } from '../repositories/setting.repository';
import { EntityManager } from '@mikro-orm/postgresql';
import { UpdateSettingDto } from '../dtos/update-setting.dto';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';
import { FilterSettingDto } from '../dtos/filter-settings.dto';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: SettingRepository,
    private readonly em: EntityManager,
  ) {}

  async findAll(
    filterDto: FilterSettingDto,
  ): Promise<PaginatedResult<ISetting>> {
    const { ...paginationQuery } = filterDto;

    return paginate<ISetting>(this.settingRepository, paginationQuery, {
      searchFields: ['name'],
      orderBy: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<ISetting> {
    const setting = await this.settingRepository.findById(id);
    if (!setting) {
      throw new NotFoundException('Setting not found');
    }
    return setting;
  }

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

  async updateById(
    settingId: string,
    updateSettingDto: UpdateSettingDto,
  ): Promise<ISetting> {
    const setting = await this.findById(settingId);

    const updateData: Partial<ISetting> = {};
    if (updateSettingDto.value !== undefined) {
      updateData.value = updateSettingDto.value;
    }
    if (updateSettingDto.description !== undefined) {
      updateData.description = updateSettingDto.description;
    }

    this.em.assign(setting, updateData);
    await this.em.flush();
    return setting;
  }
}
