import { ApiProperty } from '@nestjs/swagger';

export class UpdateGroupDetailsDto {
  @ApiProperty()
  title?: string;
}
