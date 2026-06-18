import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SettingService } from '../services/setting.service';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { Permissions } from '../../../common/decorators/permission.decorator';
import { CreateSettingDto } from '../dtos/create-setting.dto';
import { UpdateSettingDto } from '../dtos/update-setting.dto';
import { ISetting } from '../entities/setting.entity';
import { PaginatedResult } from '../../../common/utils/pagination.util';
import { FilterSettingDto } from '../dtos/filter-setting.dto';

@Controller('settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Setting created successfully')
  @Permissions('settings:create')
  async create(@Body() createSettingDto: CreateSettingDto): Promise<ISetting> {
    return this.settingService.create(createSettingDto);
  }

  @Get()
  @ResponseMessage('Settings retrieved successfully')
  @Permissions('settings:read')
  async findAll(
    @Param() filterDto: FilterSettingDto,
  ): Promise<PaginatedResult<ISetting>> {
    return this.settingService.findAll(filterDto);
  }

  @Get(':id')
  @ResponseMessage('Setting retrieved successfully')
  @Permissions('settings:read')
  async findById(@Param('id') id: string): Promise<ISetting> {
    return this.settingService.findById(id);
  }

  @Patch(':id')
  @ResponseMessage('Setting updated successfully')
  @Permissions('settings:update')
  async update(
    @Param('id') settingId: string,
    @Body() updateSettingDto: UpdateSettingDto,
  ): Promise<ISetting> {
    return this.settingService.updateById(settingId, updateSettingDto);
  }

  @Delete(':id')
  @ResponseMessage('Setting deleted successfully')
  @Permissions('settings:delete')
  async delete(@Param('id') id: string): Promise<void> {
    return this.settingService.delete(id);
  }
}
