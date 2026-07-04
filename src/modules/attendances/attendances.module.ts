import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Attendance } from './entities/attendance.entity';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceService } from './services/attendance.service';
import { User } from '../users/entities/user.entity';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [MikroOrmModule.forFeature([Attendance, User]), CommonModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendancesModule {}
