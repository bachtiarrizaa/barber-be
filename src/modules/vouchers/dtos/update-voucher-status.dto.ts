import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class UpdateVoucherStatusDto {
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive!: boolean;
}
