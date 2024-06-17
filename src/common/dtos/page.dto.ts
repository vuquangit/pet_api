import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { PaginationResponseDto } from './pagination-response.dto';

export class PageDto<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T;

  @ApiProperty({ type: () => PaginationResponseDto })
  readonly meta: PaginationResponseDto;

  constructor(data: T, meta: PaginationResponseDto) {
    this.data = data;
    this.meta = meta;
  }
}
