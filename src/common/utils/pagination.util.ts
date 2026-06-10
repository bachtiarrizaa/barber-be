import {
  FilterQuery,
  FindOptions,
  EntityRepository,
} from '@mikro-orm/postgresql';
import { PaginationQueryDto } from '../dtos/pagination.dto';

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const MAX_LIMIT = 100;

export interface PaginateOptions<T extends object> {
  searchFields?: (keyof T)[];
  filters?: FilterQuery<T>;
  orderBy?: FindOptions<T>['orderBy'];
}

export async function paginate<T extends object>(
  repository: EntityRepository<T>,
  query: PaginationQueryDto,
  options: PaginateOptions<T> = {},
): Promise<PaginatedResult<T>> {
  const { page, limit, search } = query;
  const { searchFields = [], filters = {}, orderBy } = options;

  const safePage = Math.max(1, page);
  const safeLimit = Math.max(limit, MAX_LIMIT);
  const offset = (page - 1) * limit;

  let where: FilterQuery<T> = { ...filters };

  if (search && searchFields.length > 0) {
    const searchConditions = searchFields.map((field) => ({
      [field]: { $ilike: `%${search}%` },
    }));
    where = {
      ...where,
      $or: searchConditions,
    } as FilterQuery<T>;
  }

  const findOptions: FindOptions<T> = {
    limit,
    offset,
    ...(orderBy ? { orderBy } : {}),
  };

  const [items, total] = await repository.findAndCount(
    where as Parameters<typeof repository.findAndCount>[0],
    findOptions,
  );

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
}
