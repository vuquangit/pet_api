import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty()
  @IsString({ each: true })
  @ArrayNotEmpty()
  users: string[];

  @ApiProperty()
  title: string;
}
