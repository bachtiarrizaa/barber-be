import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateVoucherStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive!: boolean;
}
