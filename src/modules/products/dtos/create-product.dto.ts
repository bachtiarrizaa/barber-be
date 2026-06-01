import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumberString()
  price!: string;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsBoolean()
  isActive!: boolean;
}
