import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Treatment } from './entities/treatment.entity';
import { TreatmentController } from './controller/treatment.controller';
import { TreatmentService } from './services/treatment.service';

@Module({
  imports: [MikroOrmModule.forFeature([Treatment])],
  controllers: [TreatmentController],
  providers: [TreatmentService],
  exports: [TreatmentService],
})
export class TreatmentModule {}
