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
} from '@nestjs/common';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { CreateVoucherDto } from '../dtos/create-voucher.dto';
import { IVoucher } from '../entities/voucher.entity';
import { VoucherService } from '../services/voucher.service';
import { FilterVoucherDto } from '../dtos/filter-voucher.dto';
import { PaginatedResult } from '../../../common/utils/pagination.util';
import { UpdateVoucherDto } from '../dtos/update-voucher.dto';
import { UpdateVoucherStatusDto } from '../dtos/update-voucher-status';

@Controller('vouchers')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Voucher created successfully')
  async create(@Body() createVoucherDto: CreateVoucherDto): Promise<IVoucher> {
    return this.voucherService.create(createVoucherDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Voucher retrieved successfully')
  async findAll(
    @Query() filterDto: FilterVoucherDto,
  ): Promise<PaginatedResult<IVoucher>> {
    return this.voucherService.findAll(filterDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Voucher retrieved successfully')
  async findById(@Param('id') id: string): Promise<IVoucher> {
    return this.voucherService.findById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Voucher updated successfully')
  async update(
    @Param('id') id: string,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ): Promise<IVoucher> {
    return this.voucherService.update(id, updateVoucherDto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Voucher updated status successfully')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateVoucherStatusDto: UpdateVoucherStatusDto,
  ): Promise<IVoucher> {
    return this.voucherService.updateStatus(id, updateVoucherStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Voucher deleted successfully')
  async delete(@Param('id') id: string): Promise<void> {
    return this.voucherService.delete(id);
  }
}
