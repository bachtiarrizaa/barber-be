import { EntityRepository } from '@mikro-orm/postgresql';
import { IStockLog } from '../entities/stock-log.entity';

export class StockLogRepository extends EntityRepository<IStockLog> {}
