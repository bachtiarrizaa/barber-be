import { EntityRepository } from '@mikro-orm/postgresql';
import { ICustomer } from '../entities/customer.entity';

export class CustomerRepository extends EntityRepository<ICustomer> {
  async findByPhone(phone: string): Promise<ICustomer | null> {
    return this.findOne({ phone });
  }

  async findById(customerId: string): Promise<ICustomer | null> {
    return this.findOne({ id: customerId });
  }
}
