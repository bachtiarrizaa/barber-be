import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class FilterVoucherDto extends PaginationQueryDto {
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
