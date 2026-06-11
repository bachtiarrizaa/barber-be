import { EntityRepository } from '@mikro-orm/postgresql';
import { IUser } from '../entities/user.entity';

export class UserRepository extends EntityRepository<IUser> {
  async findById(id: string): Promise<IUser | null> {
    return this.findOne({ id });
  }

  async findByName(name: string): Promise<IUser | null> {
    return this.findOne({ name });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email });
  }
}
