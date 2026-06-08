import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../users/repositories/user.repository';
import { UserWithRole } from '../../users/entities/user.entity';

@Injectable()
export class ProfileService {
  constructor(private readonly userRepository: UserRepository) {}

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
}
