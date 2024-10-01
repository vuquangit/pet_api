import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TransferOwnerDto {
  @ApiProperty()
  @IsNotEmpty()
  new_owner_id: string;
}
