import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationQueryDto {
  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 10;

  @IsString()
  @IsOptional()
  search?: string;
}
