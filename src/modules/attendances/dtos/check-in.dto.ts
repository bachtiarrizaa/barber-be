import { IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class CheckInDto {
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'Time must be in HH:mm or HH:mm:ss format (e.g. 08:30 or 08:30:15)',
  })
  checkIn!: string;
}
