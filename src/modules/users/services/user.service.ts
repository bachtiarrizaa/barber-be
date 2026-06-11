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
import { RoleService } from '../../roles/services/role.service';
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
    private readonly roleService: RoleService,
    private readonly em: EntityManager,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<IUser> {
    const existEmail = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existEmail) {
      throw new ConflictException('User with this email already exist');
    }

    const role = await this.roleService.findById(createUserDto.roleId);

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      treatmentCommission: createUserDto.treatmentCommission,
      productCommission: createUserDto.productCommission,
      isActive: createUserDto.isActive,
      password: hashedPassword,
      role,
    });

    await this.em.flush();
    return user;
  }

  async findAll(filterDto: FilterUserDto): Promise<PaginatedResult<IUser>> {
    const { isActive, ...paginationQuery } = filterDto;

    const filters: Partial<{ isActive: boolean }> = {};
    if (isActive !== undefined) {
      filters.isActive = isActive;
    }

    return paginate<IUser>(this.userRepository, paginationQuery, {
      searchFields: ['name', 'email'],
      filters,
      orderBy: { createdAt: 'DESC' },
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
    const user = await this.findByIdOrFail(userId);

    if (updateUserDto.name && updateUserDto.name !== user.name) {
      const existName = await this.userRepository.findByName(
        updateUserDto.name,
      );
      if (existName) {
        throw new ConflictException('User with this name already exist');
      }
    }

    const { roleId, ...updateUserData } = updateUserDto;

    const userData: Partial<IUser> = { ...updateUserData };

    if (roleId) {
      const role = await this.roleService.findById(roleId);
      userData.role = role;
    }

    this.em.assign(user, userData);
    await this.em.flush();
    return user;
  }

  async updateStatus(
    userId: string,
    updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<IUser> {
    const user = await this.findByIdOrFail(userId);
    this.em.assign(user, { isActive: updateUserStatusDto.isActive });
    await this.em.flush();
    return user;
  }

  async delete(userId: string): Promise<void> {
    const user = await this.findByIdOrFail(userId);
    await this.em.remove(user).flush();
  }

  private async findByIdOrFail(userId: string): Promise<IUser> {
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
