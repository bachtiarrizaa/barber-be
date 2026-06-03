import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateTreatmentStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive!: boolean;
}
