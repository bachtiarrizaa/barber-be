import { InjectRepository } from '@mikro-orm/nestjs';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserWithRole } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { IUser } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { Role } from '../../roles/entities/role.entity';
import { RoleRepository } from '../../roles/repositories/role.repository';
import * as bcrypt from 'bcrypt';
import { FilterUserDto } from '../dtos/filter-user.dto';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UpdateUserStatusDto } from '../dtos/update-user-status.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
    @InjectRepository(Role)
    private readonly roleRepository: RoleRepository,
    private readonly em: EntityManager,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<IUser> {
    const existName = await this.userRepository.findOne({
      name: createUserDto.name,
    });
    if (existName) {
      throw new ConflictException('User with this name already exist');
    }

    const existEmail = await this.userRepository.findOne({
      email: createUserDto.email,
    });
    if (existEmail) {
      throw new ConflictException('User with this email already exist');
    }

    const role = await this.roleRepository.findOne({
      id: createUserDto.roleId,
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const userData = {
      name: createUserDto.name,
      email: createUserDto.email,
      treatmentCommission: createUserDto.treatmentCommission,
      productCommission: createUserDto.productCommission,
      isActive: createUserDto.isActive,
      password: hashedPassword,
      role,
    };

    const user = this.userRepository.create(userData);
    await this.em.flush();
    return user;
  }

  async findUsers(filterDto: FilterUserDto): Promise<PaginatedResult<IUser>> {
    const { isActive, ...paginationQuery } = filterDto;

    const filters: Partial<{ isActive: boolean }> = {};
    if (isActive !== undefined) {
      filters.isActive = isActive;
    }

    return paginate<IUser>(this.userRepository, paginationQuery, {
      searchFields: ['name', 'email'],
      filters,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(userId: string): Promise<UserWithRole> {
    const user = await this.userRepository.findOne(
      { id: userId },
      {
        populate: ['role'],
        fields: [
          'id',
          'name',
          'email',
          'isActive',
          'treatmentCommission',
          'productCommission',
          'createdAt',
          'updatedAt',
          'role.id',
          'role.name',
        ],
      },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<IUser> {
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.name && updateUserDto.name !== user.name) {
      const existName = await this.userRepository.findOne({
        name: updateUserDto.name,
      });
      if (existName) {
        throw new ConflictException('User with this name already exist');
      }
    }

    let role = user.role;
    if (updateUserDto.roleId) {
      const findRole = await this.roleRepository.findOne({
        id: updateUserDto.roleId,
      });
      if (!findRole) {
        throw new NotFoundException('Role not found');
      }
      role = findRole;
    }

    const userData = {
      ...(updateUserDto.name && { name: updateUserDto.name }),
      ...(updateUserDto.treatmentCommission && {
        treatmentCommission: updateUserDto.treatmentCommission,
      }),
      ...(updateUserDto.productCommission && {
        productCommission: updateUserDto.productCommission,
      }),
      ...(updateUserDto.roleId && { role }),
    };

    this.em.assign(user, userData);
    await this.em.flush();
    return user;
  }

  async updateStatus(
    userId: string,
    updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<IUser> {
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userData = {
      ...(updateUserStatusDto.isActive !== undefined && {
        isActive: updateUserStatusDto.isActive,
      }),
    };

    this.em.assign(user, userData);
    await this.em.flush();
    return user;
  }

  async delete(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.em.remove(user).flush();
  }
}
