import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../../users/repositories/user.repository';
import { User, UserWithRole } from '../../users/entities/user.entity';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
    private readonly em: EntityManager,
  ) {}

  async getProfileMe(userId: string): Promise<UserWithRole> {
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

    if (!user) throw new UnauthorizedException('Unauthorized');
    return user;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserWithRole> {
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) throw new UnauthorizedException('Unauthorized');

    if (updateProfileDto.name && updateProfileDto.name !== user.name) {
      const existName = await this.userRepository.findOne({
        name: updateProfileDto.name,
      });
      if (existName) {
        throw new ConflictException('User with this name already exists');
      }
    }

    const userData = {
      ...(updateProfileDto.name && { name: updateProfileDto.name }),
    };

    this.em.assign(user, userData);
    await this.em.flush();
    return user;
  }
}
