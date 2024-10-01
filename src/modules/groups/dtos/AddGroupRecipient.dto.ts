import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddGroupRecipientDto {
  @ApiProperty()
  @IsNotEmpty()
  // username: string;
  add_user_id: string;
}
