import { EntityRepository } from '@mikro-orm/postgresql';
import { IProduct } from '../entities/product.entity';

export class ProductRepository extends EntityRepository<IProduct> {
  async findByName(name: string): Promise<IProduct | null> {
    return this.findOne({ name });
  }
}
