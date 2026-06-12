import { Controller, Get } from '@nestjs/common';
import { PermissionService } from '../services/permission.service';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { Permissions } from '../../../common/decorators/permission.decorator';
import { PermissionResponseDto } from '../dtos/permission-response.dto';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @ResponseMessage('Permissions retrieved successfully')
  @Permissions('permissions:manage')
  async findAll(): Promise<PermissionResponseDto[]> {
    return this.permissionService.findAll();
  }
}
