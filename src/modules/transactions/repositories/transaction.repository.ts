import { EntityRepository } from '@mikro-orm/postgresql';
import { ITransaction } from '../entities/transaction.entity';

export class TransactionRepository extends EntityRepository<ITransaction> {
  async findByIdWithItems(transactionId: string): Promise<ITransaction | null> {
    return this.findOne(
      { id: transactionId },
      { populate: ['items', 'customer', 'barber', 'cashier'] as const },
    );
  }
}
