import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateProductStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive!: boolean;
}
