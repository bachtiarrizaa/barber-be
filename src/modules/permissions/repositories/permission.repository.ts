import { EntityRepository } from '@mikro-orm/postgresql';
import { IPermission } from '../entities/permission.entity';

export class PermissionRepository extends EntityRepository<IPermission> {
  async findById(permissionId: string): Promise<IPermission | null> {
    return this.findOne({ id: permissionId });
  }

  async findAllNested(): Promise<IPermission[]> {
    return this.find(
      { parent: null },
      { populate: ['children'] as const, orderBy: { createdAt: 'ASC' } },
    );
  }
}
