import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { IRole } from '../entities/role.entity';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Role created successfully')
  async create(@Body() createRoleDto: CreateRoleDto): Promise<IRole> {
    return this.roleService.create(createRoleDto);
  }
}
