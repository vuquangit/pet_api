import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePresenceStatusDto {
  @IsNotEmpty()
  @IsString()
  status_message: string;
}
