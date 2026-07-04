import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { Permissions } from '../../../common/decorators/permission.decorator';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { AttendanceService } from '../services/attendance.service';
import { CheckInDto } from '../dtos/check-in.dto';
import { CheckOutDto } from '../dtos/check-out.dto';
import { FilterAttendanceDto } from '../dtos/filter-attendance.dto';
import { IAttendance } from '../entities/attendance.entity';
import { PaginatedResult } from '../../../common/utils/pagination.util';
import { multerConfig } from '../../../config/upload.config';
import { UpdateAttendanceDto } from '../dtos/update-attendance.dto';

@Controller('attendances')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Check-in successful')
  @Permissions('attendances:check-in')
  @UseInterceptors(FileInterceptor('evidence', multerConfig('attendances')))
  async checkIn(
    @Body() checkInDto: CheckInDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IAttendance> {
    return this.attendanceService.checkIn(checkInDto, file);
  }

  @Post('check-out')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Check-out successful')
  @Permissions('attendances:check-out')
  async checkOut(@Body() checkOutDto: CheckOutDto): Promise<IAttendance> {
    return this.attendanceService.checkOut(checkOutDto);
  }

  @Get()
  @ResponseMessage('Attendances retrieved successfully')
  @Permissions('attendances:check-in')
  async findAll(
    @Query() filterDto: FilterAttendanceDto,
  ): Promise<PaginatedResult<IAttendance>> {
    return this.attendanceService.findAll(filterDto);
  }

  @Get(':id')
  @ResponseMessage('Attendance retrieved successfully')
  @Permissions('attendances:check-in')
  async findById(@Param('id') id: string): Promise<IAttendance> {
    return this.attendanceService.findById(id);
  }

  @Patch(':id')
  @Permissions('attendances:edit')
  @ResponseMessage('Attendance updated successfully')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAttendanceDto,
  ): Promise<IAttendance> {
    return this.attendanceService.update(id, updateDto);
  }

  @Delete(':id')
  @Permissions('attendances:delete')
  @ResponseMessage('Attendance deleted successfully')
  async delete(@Param('id') id: string): Promise<void> {
    return this.attendanceService.delete(id);
  }
}
