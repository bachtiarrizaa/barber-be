import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum RevenueReportGroupBy {
  DAY = 'day',
  MONTH = 'month',
}

export class FilterReportRevenueDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(RevenueReportGroupBy)
  groupBy?: RevenueReportGroupBy;
}
