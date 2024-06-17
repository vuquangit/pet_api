import { ApiProperty } from '@nestjs/swagger';
import { PageDto } from './page.dto';

/**
 * Dto for the response
 */
export class ResponseDto<T> {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  path?: string;

  // @ApiProperty()
  // success: boolean;

  @ApiProperty()
  result: PageDto<T> | null;

  @ApiProperty()
  error?: any;
}
