import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { RoleModule } from '../roles/role.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [MikroOrmModule.forFeature([User]), RoleModule, CommonModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
