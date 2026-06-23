import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class StockAdjustmentDto {
  @IsNotEmpty()
  @IsUUID()
  productId!: string;

  @IsInt()
  qtyChange!: number;

  @IsNotEmpty()
  @IsString()
  note!: string;
}
