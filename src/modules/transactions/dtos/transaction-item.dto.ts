import { IsEnum, IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';
import { ItemType } from '../enums/item-type.enum';

export class TransactionItemDto {
  @IsNotEmpty()
  @IsEnum(ItemType)
  itemType!: ItemType;

  @IsNotEmpty()
  @IsUUID()
  itemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
