import { InjectRepository } from '@mikro-orm/nestjs';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { IUser } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { Role } from '../../roles/entities/role.entity';
import { RoleRepository } from '../../roles/repositories/role.repository';
import * as bcrypt from 'bcrypt';

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
}
