import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ItemType } from '../../transactions/enums/item-type.enum';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';

export class FilterTopItemsDto extends PaginationQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ItemType)
  itemType?: ItemType;
}
