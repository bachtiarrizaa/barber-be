import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { CreateVoucherDto } from '../dtos/create-voucher.dto';
import { IVoucher } from '../entities/voucher.entity';
import { VoucherService } from '../services/voucher.service';

@Controller('vouchers')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Voucher created successfully')
  async create(@Body() createVoucherDto: CreateVoucherDto): Promise<IVoucher> {
    return this.voucherService.create(createVoucherDto);
  }
}
