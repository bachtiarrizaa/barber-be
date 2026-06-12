import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^62\d{8,13}$/, {
    message: 'Phone must start with 62 and be 10-15 digits',
  })
  phone!: string;

  @IsOptional()
  @IsString()
  address?: string;
}
