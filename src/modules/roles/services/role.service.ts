import { InjectRepository } from '@mikro-orm/nestjs';
import { IRole, Role } from '../entities/role.entity';
import { RoleRepository } from '../repositories/role.repository';
import { EntityManager } from '@mikro-orm/postgresql';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { ConflictException } from '@nestjs/common';

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

    const role = this.roleRepository.create(createRoleDto);
    await this.em.persist(role).flush();
    return role;
  }
}
