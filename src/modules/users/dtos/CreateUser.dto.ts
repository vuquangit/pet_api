import { IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ERole } from '../enums/role.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  role: ERole;

  @ApiProperty({
    default: null,
  })
  name: string;

  @ApiProperty()
  // @IsNotEmpty()
  // @Length(8, 24)
  // @Matches(REGEX.PASSWORD_RULE, { message: MESSAGES.PASSWORD_RULE_MESSAGE })
  password?: string;

  @ApiProperty()
  avatar: Express.Multer.File;

  @ApiProperty()
  avatar_url?: string | null;

  @ApiProperty()
  avatar_public_id?: string | null;

  @ApiProperty()
  @IsNotEmpty()
  is_delete_avatar: boolean;

  @ApiProperty()
  address: string;

  @ApiProperty()
  phone: string | null;

  @ApiProperty({
    default: null,
  })
  birthday: Date | null;

  @ApiProperty()
  @IsNotEmpty()
  is_active: boolean;

  @ApiProperty()
  note: string;
}
