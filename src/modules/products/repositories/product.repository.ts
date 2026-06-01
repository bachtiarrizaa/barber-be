import { EntityRepository } from '@mikro-orm/postgresql';
import { IProduct } from '../entities/product.entity';

export class ProductRepository extends EntityRepository<IProduct> {}
