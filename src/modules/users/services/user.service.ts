import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { IUser } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
  ) {}

  async getProfile(userId: string): Promise<IUser> {
    const user = await this.userRepository.findOne(
      { id: userId },
      { populate: ['role'] },
    );

    if (!user) throw new NotFoundException('User not found');

    return user;
  }
}
