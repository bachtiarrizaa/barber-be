import { EntityRepository } from '@mikro-orm/postgresql';
import { IPointLog } from '../entities/point-log.entity';

export class PointLogRepository extends EntityRepository<IPointLog> {
  async findByCustomer(customerId: string): Promise<IPointLog[]> {
    return this.find(
      {
        customer: customerId,
      },
      {
        orderBy: { createdAt: 'DESC' },
      },
    );
  }
}
