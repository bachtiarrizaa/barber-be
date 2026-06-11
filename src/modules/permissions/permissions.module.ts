import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Permission } from './entities/permission.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Permission])],
  exports: [MikroOrmModule],
})
export class PermissionsModule {}
