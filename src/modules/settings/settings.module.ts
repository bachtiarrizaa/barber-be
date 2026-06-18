import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Setting } from './entities/setting.entity';
import { SettingService } from './services/setting.service';
import { SettingController } from './controllers/setting.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Setting])],
  controllers: [SettingController],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule {}
