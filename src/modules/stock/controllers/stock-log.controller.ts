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
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { StockService } from '../services/stock-log.service';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { Permissions } from '../../../common/decorators/permission.decorator';
import { FilterStockLogDto } from '../dtos/filter-stock-log.dto';
import { PaginatedResult } from '../../../common/utils/pagination.util';
import { IStockLog } from '../entities/stock-log.entity';
import { RestockDto } from '../dtos/restock.dto';
import { StockAdjustmentDto } from '../dtos/stock-adjustment.dto';

@Controller('stock')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('logs')
  @ResponseMessage('Stock logs retrieved successfully')
  @Permissions('products:read')
  async findAllLogs(
    @Query() filterDto: FilterStockLogDto,
  ): Promise<PaginatedResult<IStockLog>> {
    return this.stockService.findAllLogs(filterDto);
  }

  @Get('logs/:productId')
  @ResponseMessage('Product stock logs retrieved successfully')
  @Permissions('products:read')
  async findLogsByProduct(
    @Param('productId') productId: string,
  ): Promise<IStockLog[]> {
    return this.stockService.findlogsByProduct(productId);
  }

  @Post('restock')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Stock restocked successfully')
  @Permissions('products:update')
  async restock(@Body() restockDto: RestockDto): Promise<IStockLog> {
    return this.stockService.restock(restockDto);
  }

  @Post('adjustment')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Stock adjusted successfully')
  @Permissions('products:update')
  async stockAdjustment(
    @Body() stockAdjusmentDto: StockAdjustmentDto,
  ): Promise<IStockLog> {
    return this.stockService.stockAdjustment(stockAdjusmentDto);
  }
}
