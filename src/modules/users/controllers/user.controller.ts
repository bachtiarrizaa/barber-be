import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { FilterUserDto } from '../entities/filter-user.dto';
import { IUser } from '../entities/user.entity';
import { PaginatedResult } from '../../../common/utils/pagination.util';

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

  @Get('id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User retrieved successfully')
  @Permissions('users:read')
  async findById(@Param() userId: string): Promise<IUser> {
    return this.userService.findById(userId);
  }
}
