import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty()
  @IsNotEmpty()
  // username: string;
  user_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string;
}
