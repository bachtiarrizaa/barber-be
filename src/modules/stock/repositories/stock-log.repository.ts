import { EntityRepository } from '@mikro-orm/postgresql';
import { IStockLog } from '../entities/stock-log.entity';

export class StockLogRepository extends EntityRepository<IStockLog> {
  async findByProduct(productId: string): Promise<IStockLog[]> {
    return this.find(
      { product: productId },
      { orderBy: { createdAt: 'DESC' } },
    );
  }
}
