import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { SettingService } from '../services/setting.service';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { Permissions } from '../../../common/decorators/permission.decorator';
import { UpdateSettingDto } from '../dtos/update-setting.dto';
import { ISetting } from '../entities/setting.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { FilterSettingDto } from '../dtos/filter-settings.dto';
import { PaginatedResult } from '../../../common/utils/pagination.util';

@Controller('settings')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @ResponseMessage('Settings retrieved successfully')
  @Permissions('settings:read')
  async findAll(
    @Param() filterDto: FilterSettingDto,
  ): Promise<PaginatedResult<ISetting>> {
    return this.settingService.findAll(filterDto);
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
}
