import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { ICustomer } from '../entities/customer.entity';
import { Permissions } from '../../../common/decorators/permission.decorator';
import { FilterCustomerDto } from '../dtos/filter-customer.dto';
import { PaginatedResult } from '../../../common/utils/pagination.util';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';
import { RedeemVoucherDto } from '../../vouchers/dtos/reedem-voucher.dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ResponseMessage('Customer created successfully')
  @Permissions('customers:create')
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<ICustomer> {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @ResponseMessage('Customer retrieved successfully')
  @Permissions('customers:read')
  async findAll(
    @Query() filterDto: FilterCustomerDto,
  ): Promise<PaginatedResult<ICustomer>> {
    return this.customerService.findAll(filterDto);
  }

  @Get(':id')
  @ResponseMessage('Customer retrieved successfully')
  @Permissions('customers:read')
  async findById(@Param('id') customerId: string): Promise<ICustomer> {
    return this.customerService.findById(customerId);
  }

  @Patch(':id')
  @ResponseMessage('Customer updated successfully')
  @Permissions('customers:update')
  async update(
    @Param('id') customerId: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<ICustomer> {
    return this.customerService.update(customerId, updateCustomerDto);
  }

  @Delete(':id')
  @ResponseMessage('Customer deleted successfully')
  @Permissions('customers:delete')
  async delete(@Param('id') customerId: string): Promise<void> {
    return this.customerService.delete(customerId);
  }

  @Get(':id/point-logs')
  @ResponseMessage('Customer point logs retrieved successfully')
  @Permissions('customers:read')
  async getPointLogs(@Param('id') customerId: string) {
    return this.customerService.getPointLogs(customerId);
  }

  @Get(':id/vouchers')
  @ResponseMessage('Customer vouchers retrieved successfully')
  @Permissions('customers:read')
  async getVouchersCustomer(@Param('id') customerId: string) {
    return this.customerService.getVouchersCustomer(customerId);
  }

  @Post(':id/redeem-voucher')
  @ResponseMessage('Voucher redeemed successfully')
  @Permissions('customers:update')
  async redeemVoucher(
    @Param('id') customerId: string,
    @Body() reedemVoucherDto: RedeemVoucherDto,
  ) {
    return this.customerService.redeemVoucher(customerId, reedemVoucherDto);
  }
}
