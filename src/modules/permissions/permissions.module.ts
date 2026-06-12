import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Permission } from './entities/permission.entity';
import { PermissionController } from './controllers/permission.controller';
import { PermissionService } from './services/permission.service';

@Module({
  imports: [MikroOrmModule.forFeature([Permission])],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [MikroOrmModule],
})
export class PermissionsModule {}
