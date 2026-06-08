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
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { CreateUserDto } from '../dtos/create-user.dto';
import { Permissions } from '../../../common/decorators/permission.decorator';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { FilterUserDto } from '../dtos/filter-user.dto';
import { IUser, UserWithRole } from '../entities/user.entity';
import { PaginatedResult } from '../../../common/utils/pagination.util';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UpdateUserStatusDto } from '../dtos/update-user-status.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('User created successfully')
  @Permissions('users:create')
  async create(@Body() createUserDto: CreateUserDto): Promise<IUser> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User retrieved successfully')
  @Permissions('users:read')
  async findUsers(
    @Query() filterDto: FilterUserDto,
  ): Promise<PaginatedResult<IUser>> {
    return this.userService.findUsers(filterDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User retrieved successfully')
  @Permissions('users:read')
  async findById(@Param('id') userId: string): Promise<UserWithRole> {
    return await this.userService.findById(userId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Updated user successfully')
  @Permissions('users:update')
  async update(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<IUser> {
    return this.userService.update(userId, updateUserDto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User status updated successfully')
  @Permissions('users:update')
  async updateStatus(
    @Param('id') userId: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<IUser> {
    return this.userService.updateStatus(userId, updateUserStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User deleted successfully')
  @Permissions('users:delete')
  async delete(@Param('id') userId: string): Promise<void> {
    return this.userService.delete(userId);
  }
}
