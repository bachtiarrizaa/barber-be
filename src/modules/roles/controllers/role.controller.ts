import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { IRole } from '../entities/role.entity';
import { FilterRoleDto } from '../dtos/filter-role.dto';
import { PaginatedResult } from '../../../common/utils/pagination.util';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { Permissions } from '../../../common/decorators/permission.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Role created successfully')
  @Permissions('roles:create')
  async create(@Body() createRoleDto: CreateRoleDto): Promise<IRole> {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ResponseMessage('Roles retrieved successfully')
  @Permissions('roles:read')
  async findAll(
    @Query() filterDto: FilterRoleDto,
  ): Promise<PaginatedResult<IRole>> {
    return this.roleService.findAll(filterDto);
  }

  @Get(':id')
  @ResponseMessage('Role retrieved successfully')
  @Permissions('roles:read')
  async findById(@Param('id') id: string): Promise<IRole> {
    return this.roleService.findById(id);
  }

  @Put(':id')
  @ResponseMessage('Role updated successfully')
  @Permissions('roles:update')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<IRole> {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ResponseMessage('Role deleted successfully')
  @Permissions('roles:delete')
  async delete(@Param('id') id: string) {
    return this.roleService.delete(id);
  }
}
