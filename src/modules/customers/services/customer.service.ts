import { InjectRepository } from '@mikro-orm/nestjs';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Customer, ICustomer } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { CustomerRepository } from '../repositories/customer.repository';
import { FilterCustomerDto } from '../dtos/filter-customer.dto';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRespository: CustomerRepository,
    private readonly em: EntityManager,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<ICustomer> {
    const existPhone = await this.customerRespository.findByPhone(
      createCustomerDto.phone,
    );
    if (existPhone) {
      throw new ConflictException('Phone number already exist');
    }

    const customer = this.customerRespository.create({
      name: createCustomerDto.name,
      phone: createCustomerDto.phone,
      address: createCustomerDto.address ?? null,
    });

    await this.em.flush();
    return customer;
  }

  async findAll(
    filterDto: FilterCustomerDto,
  ): Promise<PaginatedResult<ICustomer>> {
    const { ...paginationQuery } = filterDto;

    return paginate<ICustomer>(this.customerRespository, paginationQuery, {
      searchFields: ['name', 'phone'],
      orderBy: { createdAt: 'DESC' },
    });
  }

  async findById(customerId: string): Promise<ICustomer> {
    const customer = await this.customerRespository.findById(customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }
}
