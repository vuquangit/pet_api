import { IsNotEmpty, IsEmail, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ERole } from '../enums/role.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  // @IsNumber()
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

  @ApiProperty({
    default: null,
  })
  start_date: Date | null;

  @ApiProperty({
    default: null,
  })
  end_date: Date | null;

  // skip error in User entity ?
  @ApiProperty({
    default: null,
  })
  created_at: Date | null;

  @ApiProperty({
    default: null,
  })
  updated_at: Date | null;

  @ApiProperty({
    default: null,
  })
  id: string;
}
