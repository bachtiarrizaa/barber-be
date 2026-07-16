import { IsDateString, IsOptional } from 'class-validator';

export class ExportReportDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
