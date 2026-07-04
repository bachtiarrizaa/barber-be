import { defineEntity, InferEntity, p } from '@mikro-orm/core';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../users/entities/user.entity';

export const Attendance = defineEntity({
  name: 'Attendance',
  tableName: 'attendances',
  repository: () => AttendanceRepository,
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => uuidv4()),
    user: () => p.manyToOne(User),
    date: p.date(),
    checkIn: p.string().columnType('time'),
    checkOut: p.string().columnType('time').nullable(),
    evidence: p.string(),
    note: p.text().nullable(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export type IAttendance = InferEntity<typeof Attendance>;
