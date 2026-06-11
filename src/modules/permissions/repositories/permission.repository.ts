import { EntityRepository } from '@mikro-orm/postgresql';
import { IPermission } from '../entities/permission.entity';

export class PermissionRepository extends EntityRepository<IPermission> {}
