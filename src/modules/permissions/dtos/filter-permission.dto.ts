import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';

export class FilterPermissionDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  parentId?: string;
}
