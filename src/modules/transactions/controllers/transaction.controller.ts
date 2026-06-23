import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { FilterTransactionDto } from '../dtos/filter-transaction.dto';
import { ITransaction } from '../entities/transaction.entity';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { PaginatedResult } from '../../../common/utils/pagination.util';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { Permissions } from '../../../common/decorators/permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@Controller('transactions')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Transaction created successfully')
  @Permissions('transactions:create')
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ITransaction> {
    return this.transactionService.create(createTransactionDto, user.sub);
  }

  @Get()
  @ResponseMessage('Transactions retrieved successfully')
  @Permissions('transactions:read')
  async findAll(
    @Query() filterDto: FilterTransactionDto,
  ): Promise<PaginatedResult<ITransaction>> {
    return this.transactionService.findAll(filterDto);
  }

  @Get(':id')
  @ResponseMessage('Transaction retrieved successfully')
  @Permissions('transactions:read')
  async findById(@Param('id') id: string): Promise<ITransaction> {
    return this.transactionService.findById(id);
  }
}
