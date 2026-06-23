import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';

export class FilterTransactionDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  barberId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;
}
