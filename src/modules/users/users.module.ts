import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { Role } from '../roles/entities/role.entity';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [MikroOrmModule.forFeature([User, Role])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
