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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { CreateVoucherDto } from '../dtos/create-voucher.dto';
import { IVoucher } from '../entities/voucher.entity';
import { VoucherService } from '../services/voucher.service';
import { FilterVoucherDto } from '../dtos/filter-voucher.dto';
import { PaginatedResult } from '../../../common/utils/pagination.util';
import { UpdateVoucherDto } from '../dtos/update-voucher.dto';
import { UpdateVoucherStatusDto } from '../dtos/update-voucher-status.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { Permissions } from '../../../common/decorators/permission.decorator';

@Controller('vouchers')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Voucher created successfully')
  @Permissions('vouchers:create')
  async create(@Body() createVoucherDto: CreateVoucherDto): Promise<IVoucher> {
    return this.voucherService.create(createVoucherDto);
  }

  @Get()
  @ResponseMessage('Vouchers retrieved successfully')
  @Permissions('vouchers:read')
  async findAll(
    @Query() filterDto: FilterVoucherDto,
  ): Promise<PaginatedResult<IVoucher>> {
    return this.voucherService.findAll(filterDto);
  }

  @Get(':id')
  @ResponseMessage('Voucher retrieved successfully')
  @Permissions('vouchers:read')
  async findById(@Param('id') id: string): Promise<IVoucher> {
    return this.voucherService.findById(id);
  }

  @Put(':id')
  @ResponseMessage('Voucher updated successfully')
  @Permissions('vouchers:update')
  async update(
    @Param('id') id: string,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ): Promise<IVoucher> {
    return this.voucherService.update(id, updateVoucherDto);
  }

  @Patch(':id/status')
  @ResponseMessage('Voucher status updated successfully')
  @Permissions('vouchers:update')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateVoucherStatusDto: UpdateVoucherStatusDto,
  ): Promise<IVoucher> {
    return this.voucherService.updateStatus(id, updateVoucherStatusDto);
  }

  @Delete(':id')
  @ResponseMessage('Voucher deleted successfully')
  @Permissions('vouchers:delete')
  async delete(@Param('id') id: string): Promise<void> {
    return this.voucherService.delete(id);
  }
}
