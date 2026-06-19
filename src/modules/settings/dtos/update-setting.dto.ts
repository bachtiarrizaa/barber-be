import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSettingDto {
  @IsNotEmpty()
  @IsString()
  value!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
