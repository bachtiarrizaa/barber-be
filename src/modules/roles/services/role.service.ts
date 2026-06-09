import { InjectRepository } from '@mikro-orm/nestjs';
import { IRole, Role } from '../entities/role.entity';
import { RoleRepository } from '../repositories/role.repository';
import { EntityManager } from '@mikro-orm/postgresql';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { FilterRoleDto } from '../dtos/filter-role.dto';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';
import { UpdateRoleDto } from '../dtos/update-role.dto';

export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: RoleRepository,
    private readonly em: EntityManager,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<IRole> {
    const existRole = await this.roleRepository.findOne({
      name: createRoleDto.name,
    });
    if (existRole) {
      throw new ConflictException('Role with this name already exist');
    }

    const roleData = {
      name: createRoleDto.name,
    };

    const role = this.roleRepository.create(roleData);
    await this.em.flush();
    return role;
  }

  async findAll(filterDto: FilterRoleDto): Promise<PaginatedResult<IRole>> {
    const { ...paginationQuery } = filterDto;

    return paginate<IRole>(this.roleRepository, paginationQuery, {
      searchFields: ['name'],
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<IRole> {
    const role = await this.roleRepository.findOne(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<IRole> {
    const role = await this.findById(id);

    if (updateRoleDto && updateRoleDto.name !== role.name) {
      const existRole = await this.roleRepository.findOne({
        name: updateRoleDto.name,
      });
      if (existRole) {
        throw new ConflictException('Role with this name already exist');
      }
    }

    const roleData = {
      ...(updateRoleDto.name && { name: updateRoleDto.name }),
    };

    this.em.assign(role, roleData);
    await this.em.flush();
    return role;
  }

  async delete(id: string): Promise<void> {
    const role = await this.findById(id);
    await this.em.remove(role).flush();
  }
}
