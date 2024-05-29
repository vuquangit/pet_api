import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OauthLoginEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  access_token_oauth: string;

  @ApiProperty()
  @IsNotEmpty()
  id_token: string;
}
