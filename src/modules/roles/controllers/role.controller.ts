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
} from '@nestjs/common';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { IRole } from '../entities/role.entity';
import { FilterRoleDto } from '../dtos/filter-role.dto';
import { PaginatedResult } from '../../../common/utils/pagination.util';
import { UpdateRoleDto } from '../dtos/update-role.dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Role created successfully')
  async create(@Body() createRoleDto: CreateRoleDto): Promise<IRole> {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Role retrieved successfully')
  async findAll(
    @Query() filterDto: FilterRoleDto,
  ): Promise<PaginatedResult<IRole>> {
    return this.roleService.findAll(filterDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Role retrieved successfully')
  async findById(@Param('id') id: string): Promise<IRole> {
    return this.roleService.findById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Role updated successfully')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<IRole> {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Role deleted successfully')
  async delete(@Param('id') id: string) {
    return this.roleService.delete(id);
  }
}
