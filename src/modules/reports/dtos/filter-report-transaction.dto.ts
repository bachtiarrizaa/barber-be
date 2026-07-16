import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';

export enum ReportTransactionStatus {
  COMPLETED = 'completed',
  PENDING_PAYMENT = 'pending_payment',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export class FilterReportTransactionDto extends PaginationQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ReportTransactionStatus)
  status?: ReportTransactionStatus;

  @IsOptional()
  @IsUUID()
  barberId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
