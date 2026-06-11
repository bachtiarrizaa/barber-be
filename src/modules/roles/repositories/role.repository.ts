import { EntityRepository } from '@mikro-orm/postgresql';
import { IRole } from '../entities/role.entity';

export class RoleRepository extends EntityRepository<IRole> {
  async findByName(name: string): Promise<IRole | null> {
    return this.findOne({ name });
  }

  async findById(roleId: string): Promise<IRole | null> {
    return this.findOne({ id: roleId });
  }
}
