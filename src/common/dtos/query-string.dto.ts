import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryStringDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  readonly page?: number;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @IsNumber()
  readonly limit?: number;

  @ApiProperty({ example: 'DESC' })
  @IsOptional()
  @IsString()
  readonly sort?: 'DESC' | 'ASC';

  @ApiProperty({ example: 'create_date' })
  @IsOptional()
  @IsString()
  readonly sort_by?: string;
}
