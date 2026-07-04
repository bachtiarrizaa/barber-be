import { IsOptional, IsString, IsDateString, Matches } from 'class-validator';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'checkIn must be in HH:mm or HH:mm:ss format (e.g. 08:30 or 08:30:15)',
  })
  checkIn?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'checkOut must be in HH:mm or HH:mm:ss format (e.g. 17:45 or 17:45:20)',
  })
  checkOut?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
