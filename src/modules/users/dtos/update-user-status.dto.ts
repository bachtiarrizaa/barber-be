import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusDto {
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsNotEmpty()
  isActive!: boolean;
}
