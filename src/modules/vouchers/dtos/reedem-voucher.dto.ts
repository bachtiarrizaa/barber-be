import { IsNotEmpty, IsUUID } from 'class-validator';

export class RedeemVoucherDto {
  @IsNotEmpty()
  @IsUUID()
  voucherId!: string;
}
