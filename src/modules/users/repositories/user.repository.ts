import { EntityRepository } from '@mikro-orm/postgresql';
import { IUser } from '../entities/user.entity';

export class UserRepository extends EntityRepository<IUser> {}
