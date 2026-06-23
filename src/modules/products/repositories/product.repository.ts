import { EntityRepository } from '@mikro-orm/postgresql';
import { IProduct } from '../entities/product.entity';

export class ProductRepository extends EntityRepository<IProduct> {
  async findByName(name: string): Promise<IProduct | null> {
    return this.findOne({ name });
  }

  async findById(productId: string): Promise<IProduct | null> {
    return this.findOne({ id: productId });
  }

  async findActiveById(productId: string): Promise<IProduct | null> {
    return this.findOne({ id: productId, isActive: true });
  }
}
