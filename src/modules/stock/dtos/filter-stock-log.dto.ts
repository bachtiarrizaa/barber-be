import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';

export class FilterStockLogDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  type?: string;
}
