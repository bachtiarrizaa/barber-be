import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { TransactionItemDto } from './transaction-item.dto';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsUUID()
  barberId!: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  items!: TransactionItemDto[];

  @IsOptional()
  @IsUUID()
  voucherRedemptionId?: string;

  @IsNotEmpty()
  @IsIn(['cash', 'qris', 'transfer'])
  paymentMethod!: 'cash' | 'qris' | 'transfer';

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;
}
