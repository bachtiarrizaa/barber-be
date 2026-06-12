import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { ICustomer } from '../entities/customer.entity';
import { Permissions } from '../../../common/decorators/permission.decorator';
import { FilterCustomerDto } from '../dtos/filter-customer.dto';
import { PaginatedResult } from '../../../common/utils/pagination.util';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';

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
    @Param() filterDto: FilterCustomerDto,
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
}
