import { EntityRepository } from '@mikro-orm/postgresql';
import { IUser } from '../entities/user.entity';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';
import {
  paginate,
  PaginatedResult,
  PaginateOptions,
} from '../../../common/utils/pagination.util';

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

  async findAllWithPaginated(
    query: PaginationQueryDto,
    options: PaginateOptions<IUser> = {},
  ): Promise<PaginatedResult<IUser>> {
    return paginate<IUser>(this, query, {
      ...options,
      populate: ['role'],
      fields: [
        'id',
        'name',
        'email',
        'role.id',
        'role.name',
        'treatmentCommission',
        'productCommission',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  }
}
