import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class UpdateProductStatusDto {
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive!: boolean;
}
