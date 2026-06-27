import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { Permissions } from '../../../common/decorators/permission.decorator';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { TransactionService } from '../services/transaction.service';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { FilterTransactionDto } from '../dtos/filter-transaction.dto';
import { ITransaction } from '../entities/transaction.entity';
import { PaginatedResult } from '../../../common/utils/pagination.util';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { XenditService } from '../../xendit/services/xendit.service';
import { XenditWebhookDto } from '../../xendit/dtos/xendit-webhook.dto';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly xenditService: XenditService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Transaction created successfully')
  @Permissions('transactions:create')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  async create(
    @Body() dto: CreateTransactionDto,
    @Req() req: { user: JwtPayload },
  ): Promise<ITransaction> {
    return this.transactionService.create(dto, req.user.sub);
  }

  @Get()
  @ResponseMessage('Transactions retrieved successfully')
  @Permissions('transactions:read')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  async findAll(
    @Query() filterDto: FilterTransactionDto,
  ): Promise<PaginatedResult<ITransaction>> {
    return this.transactionService.findAll(filterDto);
  }

  @Get(':id')
  @ResponseMessage('Transaction retrieved successfully')
  @Permissions('transactions:read')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  async findById(@Param('id') id: string): Promise<ITransaction> {
    return this.transactionService.findById(id);
  }

  @Post(':id/cancel')
  @ResponseMessage('Transaction cancelled successfully')
  @Permissions('transactions:cancel')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  async cancel(@Param('id') id: string): Promise<ITransaction> {
    return this.transactionService.cancel(id);
  }

  @Post('webhook/xendit')
  @ResponseMessage('Webhook processed successfully')
  async handleXenditWebhook(
    @Headers('x-callback-token') callbackToken: string,
    @Body() body: XenditWebhookDto,
  ): Promise<{ received: boolean }> {
    if (!this.xenditService.verifyWebhookSignature(callbackToken)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    switch (body.status) {
      case 'PAID':
      case 'SETTLED':
        await this.transactionService.finalizeFromWebhook(body.id);
        break;
      case 'EXPIRED':
        await this.transactionService.expireFromWebhook(body.id);
        break;
      default:
        // unhandled status — log only, always return 2xx so Xendit doesn't retry
        break;
    }

    return { received: true };
  }
}
