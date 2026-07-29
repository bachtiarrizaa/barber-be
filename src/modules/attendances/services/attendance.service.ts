import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Attendance, IAttendance } from '../entities/attendance.entity';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { UserRepository } from '../../users/repositories/user.repository';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../../users/entities/user.entity';
import { CheckInDto } from '../dtos/check-in.dto';
import { CheckOutDto } from '../dtos/check-out.dto';
import { FilterAttendanceDto } from '../dtos/filter-attendance.dto';
import { UpdateAttendanceDto } from '../dtos/update-attendance.dto';
import { FileService } from '../../../common/services/file.service';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';

function todayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: AttendanceRepository,
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
    private readonly em: EntityManager,
    private readonly fileService: FileService,
  ) {}

  async checkIn(
    checkInDto: CheckInDto,
    file: Express.Multer.File,
  ): Promise<IAttendance> {
    if (!file) {
      throw new BadRequestException('Selfie image is required for check-in');
    }

    const user = await this.userRepository.findById(checkInDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const today = todayDateString();
    const existingAttendance =
      await this.attendanceRepository.findTodayByUserId(
        checkInDto.userId,
        today,
      );

    if (existingAttendance) {
      throw new BadRequestException('Already checked in today');
    }

    const checkInTime = checkInDto.checkIn;

    const attendance = this.em.create(Attendance, {
      user,
      date: today,
      checkIn: checkInTime,
      checkOut: null,
      evidence: file.path,
      note: checkInDto.note ?? null,
    });

    await this.em.flush();
    return attendance;
  }

  async checkOut(checkOutDto: CheckOutDto): Promise<IAttendance> {
    const user = await this.userRepository.findById(checkOutDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const today = todayDateString();
    const attendance = await this.attendanceRepository.findTodayByUserId(
      checkOutDto.userId,
      today,
    );

    if (!attendance) {
      throw new BadRequestException('No check-in record found for today');
    }

    if (attendance.checkOut) {
      throw new BadRequestException('Already checked out today');
    }

    attendance.checkOut = checkOutDto.checkOut;
    await this.em.flush();

    return attendance;
  }

  async findAll(
    filterDto: FilterAttendanceDto,
  ): Promise<PaginatedResult<IAttendance>> {
    const { userId, ...paginationQuery } = filterDto;

    const filters: Record<string, unknown> = {};
    if (userId) filters.user = userId;

    return paginate<IAttendance>(this.attendanceRepository, paginationQuery, {
      filters,
      orderBy: { createdAt: 'DESC' },
      populate: ['user'] as const,
      searchFields: ['note'],
    });
  }

  async findById(id: string): Promise<IAttendance> {
    const attendance = await this.attendanceRepository.findOne(
      { id },
      { populate: ['user'] as const },
    );
    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }
    return attendance;
  }

  async update(
    id: string,
    updateDto: UpdateAttendanceDto,
  ): Promise<IAttendance> {
    const attendance = await this.findById(id);
    this.em.assign(attendance, updateDto);
    await this.em.flush();
    return attendance;
  }

  async delete(id: string): Promise<void> {
    const attendance = await this.findById(id);
    if (attendance.evidence) {
      await this.fileService.deleteImage(attendance.evidence);
    }
    await this.em.remove(attendance).flush();
  }
}
