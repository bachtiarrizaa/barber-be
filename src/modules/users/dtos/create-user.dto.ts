import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDecimal,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsUUID()
  @IsNotEmpty()
  roleId!: string;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  treatmentCommission!: string;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  productCommission!: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsNotEmpty()
  isActive!: boolean;
}
