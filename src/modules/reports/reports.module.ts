import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ReportController } from './controllers/report.controller';
import { ReportService } from './services/report.service';
import { ReportRepository } from './repositories/report.repository';
import { Transaction } from '../transactions/entities/transaction.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Transaction])],
  controllers: [ReportController],
  providers: [ReportService, ReportRepository],
})
export class ReportModule {}
