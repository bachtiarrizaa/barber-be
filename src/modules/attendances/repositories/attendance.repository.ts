import { EntityRepository } from '@mikro-orm/postgresql';
import { IAttendance } from '../entities/attendance.entity';

export class AttendanceRepository extends EntityRepository<IAttendance> {
  async findTodayByUserId(
    userId: string,
    today: string,
  ): Promise<IAttendance | null> {
    return this.findOne({ user: userId, date: today });
  }
}
