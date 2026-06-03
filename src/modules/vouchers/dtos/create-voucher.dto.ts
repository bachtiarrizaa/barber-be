import {
  IsDecimal,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum VoucherType {
  PERCENT = 'percent',
  RUPIAH = 'rupiah',
}

export class CreateVoucherDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  pointsRequired!: number;

  @IsEnum(VoucherType)
  @IsNotEmpty()
  type!: VoucherType;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  value!: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  isActive?: boolean;
}
