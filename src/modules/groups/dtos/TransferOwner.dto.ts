import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TransferOwnerDto {
  @ApiProperty()
  @IsNotEmpty()
  // @IsNumber()
  newOwnerId: string;
}
