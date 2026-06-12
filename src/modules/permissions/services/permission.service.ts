import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IPermission, Permission } from '../entities/permission.entity';
import { PermissionRepository } from '../repositories/permission.repository';
import { PermissionResponseDto } from '../dtos/permission-response.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async findAll(): Promise<PermissionResponseDto[]> {
    const parents = await this.permissionRepository.findAllNested();

    return parents.map((parent) => ({
      id: parent.id,
      name: parent.name,
      description: parent.description ?? null,
      children: parent.children.getItems().map((child) => ({
        id: child.id,
        name: child.name,
        actionCode: child.actionCode ?? null,
        description: child.description ?? null,
      })),
    }));
  }

  async findById(permissionId: string): Promise<IPermission> {
    const permission = await this.permissionRepository.findById(permissionId);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }
}
