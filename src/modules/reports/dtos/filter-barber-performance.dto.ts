import { IsDateString, IsOptional } from 'class-validator';

export class FilterBarberPerformanceDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
