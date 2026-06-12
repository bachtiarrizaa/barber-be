import { InjectRepository } from '@mikro-orm/nestjs';
import { IRole, Role } from '../entities/role.entity';
import { RoleRepository } from '../repositories/role.repository';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { FilterRoleDto } from '../dtos/filter-role.dto';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { IPermission } from '../../permissions/entities/permission.entity';
import { AssignPermissionDto } from '../dtos/assign-permission.dto';
import { PermissionRepository } from '../../permissions/repositories/permission.repository';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly em: EntityManager,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<IRole> {
    const existRole = await this.roleRepository.findByName(createRoleDto.name);
    if (existRole) {
      throw new ConflictException('Role with this name already exist');
    }

    const role = this.roleRepository.create(createRoleDto);
    await this.em.flush();
    return role;
  }

  async assignPermission(
    roleId: string,
    assignPermissionDto: AssignPermissionDto,
  ): Promise<void> {
    const role = await this.roleRepository.findByIdWithPermissions(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permission = await this.permissionRepository.findById(
      assignPermissionDto.permissionId,
    );
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const alreadyAssigned = role.permissions
      .getItems()
      .some((p) => p.id === permission.id);

    if (!alreadyAssigned) {
      role.permissions.add(permission);
      await this.em.flush();
    }
  }

  async unassignPermission(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    const role = await this.roleRepository.findByIdWithPermissions(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permission = role.permissions
      .getItems()
      .find((p) => p.id === permissionId);

    if (!permission) {
      throw new NotFoundException('Permission not assigned to this role');
    }

    role.permissions.remove(permission);
    await this.em.flush();
  }

  async findAll(filterDto: FilterRoleDto): Promise<PaginatedResult<IRole>> {
    const { ...paginationQuery } = filterDto;

    return paginate<IRole>(this.roleRepository, paginationQuery, {
      searchFields: ['name'],
      orderBy: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<IRole> {
    const role = await this.roleRepository.findOne(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async getRolePermissions(id: string): Promise<IPermission[]> {
    const role = await this.roleRepository.findByIdWithPermissions(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role.permissions.getItems();
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<IRole> {
    const role = await this.findById(id);

    if (updateRoleDto && updateRoleDto.name !== role.name) {
      const existRole = await this.roleRepository.findByName(
        updateRoleDto.name,
      );
      if (existRole) {
        throw new ConflictException('Role with this name already exist');
      }
    }

    this.em.assign(role, updateRoleDto);
    await this.em.flush();
    return role;
  }

  async delete(id: string): Promise<void> {
    const role = await this.findById(id);
    await this.em.remove(role).flush();
  }
}
