import { InjectRepository } from '@mikro-orm/nestjs';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Setting, ISetting } from '../entities/setting.entity';
import { SettingRepository } from '../repositories/setting.repository';
import { EntityManager } from '@mikro-orm/postgresql';
import { CreateSettingDto } from '../dtos/create-setting.dto';
import { UpdateSettingDto } from '../dtos/update-setting.dto';
import { toSnakeCase } from '../../../common/utils/slug.util';
import { FilterSettingDto } from '../dtos/filter-setting.dto';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: SettingRepository,
    private readonly em: EntityManager,
  ) {}

  async create(createSettingDto: CreateSettingDto): Promise<ISetting> {
    const existName = await this.settingRepository.findByName(
      createSettingDto.name,
    );
    if (existName) {
      throw new ConflictException('Setting with this name already exists');
    }

    const key = toSnakeCase(createSettingDto.name);

    const existKey = await this.settingRepository.findByKey(key);
    if (existKey) {
      throw new ConflictException(
        `Setting with generated key '${key}' already exists`,
      );
    }

    const setting = this.settingRepository.create({
      ...createSettingDto,
      key,
      isSystem: false,
    });

    await this.em.flush();
    return setting;
  }

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
    const setting = await this.settingRepository.findById(settingId);
    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    this.em.assign(setting, updateSettingDto);
    await this.em.flush();
    return setting;
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

  async delete(id: string): Promise<void> {
    const setting = await this.findById(id);

    if (setting.isSystem) {
      throw new ForbiddenException('System settings cannot be deleted');
    }

    await this.em.remove(setting).flush();
  }
}
