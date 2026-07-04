import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';

export class FilterAttendanceDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  userId?: string;
}
