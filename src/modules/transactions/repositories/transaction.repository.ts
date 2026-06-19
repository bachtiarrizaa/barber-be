import { EntityRepository } from '@mikro-orm/postgresql';
import { ITransaction } from '../entities/transaction.entity';

export class TransactionRepository extends EntityRepository<ITransaction> {}
