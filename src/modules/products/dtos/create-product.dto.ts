import {
  IsBoolean,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  price!: string;

  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt()
  @Min(0)
  stock!: number;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsNotEmpty()
  isActive!: boolean;
}
