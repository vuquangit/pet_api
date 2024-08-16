import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class OauthLoginAppDto {
  @IsNotEmpty()
  @ApiProperty()
  id_token: string;

  @IsNotEmpty()
  @ApiProperty()
  access_token: string;
}
