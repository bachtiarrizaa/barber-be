import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { CreateVoucherDto } from '../dtos/create-voucher.dto';
import { IVoucher } from '../entities/voucher.entity';
import { VoucherService } from '../services/voucher.service';
import { FilterVoucherDto } from '../dtos/filter-voucher.dto';
import { PaginatedResult } from '../../../common/utils/pagination.util';

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
}
