import { IsNumber, IsOptional, IsString } from 'class-validator';

export class XenditWebhookDto {
  @IsString()
  id!: string;

  @IsString()
  external_id!: string;

  @IsString()
  status!: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  paid_amount?: number;

  @IsOptional()
  @IsString()
  paid_at?: string;
}
