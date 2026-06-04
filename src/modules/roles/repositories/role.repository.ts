import { EntityRepository } from '@mikro-orm/postgresql';
import { IRole } from '../entities/role.entity';

export class RoleRepository extends EntityRepository<IRole> {}
