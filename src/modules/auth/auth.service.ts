// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { IUserToken } from '@/modules/auth/interfaces/auth.interface';
import { ConfigService } from '@nestjs/config';
import { User } from '@/modules/users/entities/user.entity';

import { MailingService } from '@/modules/mailing/mailing.service';
import { UsersService } from '@/modules/users/services/users.service';
import { LoginUserDto } from '@/modules/auth/dtos/LoginUser.dto';
import { ChangePasswordDto } from '@/modules/auth/dtos/ChangePassword.dto';
import { ForgotPasswordDto } from '@/modules/auth/dtos/ForgotPassword.dto';
import { EXCEPTION_CODE } from '@/constants/exceptionCode';
import { UpdateResult } from '@/common/interfaces/common.interface';
import { RegisterDto } from './dtos/Register.dto';
import { ERole } from '../users/enums/role.enum';
import { CreateUserDto } from '../users/dtos/CreateUser.dto';
import { UserNotFoundException } from '../users/exceptions/UserNotFound';
import { Services } from '@/constants/constants';
import { IImageStorageService } from '../image-storage/image-storage';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    @Inject(forwardRef(() => MailingService))
    private mailService: MailingService,

    @Inject(Services.IMAGE_UPLOAD_SERVICE)
    private readonly imageStorageService: IImageStorageService,
  ) {}

  async login(loginUserDto: LoginUserDto): Promise<IUserToken> {
    const user = await this.usersService.findUserByEmail(
      loginUserDto.email,
      true,
    );
    if (!user) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.USER.EMAIL_NOT_FOUND,
        message: 'Email not found',
      });
    }

    const passwordsMatches = await this.validatePassword(
      loginUserDto.password,
      user.password,
    );

    if (!passwordsMatches) {
      throw new BadRequestException({
        code: EXCEPTION_CODE.USER.WRONG_PASSWORD,
        message: 'Password is incorrect',
      });
    }

    const userFound = await this.usersService.findById(user._id.toString());
    if (!userFound) {
      throw new UserNotFoundException();
    }
    return await this.generateTokens(userFound);
  }

  async logout(): Promise<{ success: boolean }> {
    // handle event logout
    // ...

    return { success: true };
  }

  async refreshToken(user: User): Promise<any> {
    const userFound = await this.usersService.findById(user._id.toString());
    if (!userFound) {
      throw new UserNotFoundException();
    }
    return await this.generateTokens(userFound);
  }

  async changePassword(
    user: User,
    changePassword: ChangePasswordDto,
  ): Promise<UpdateResult> {
    const userFound = await this.usersService.findUserByEmail(user.email);
    if (!userFound) {
      throw new UserNotFoundException();
    }

    const passwordsMatches = await this.validatePassword(
      changePassword.password,
      userFound.password,
    );
    if (!passwordsMatches) {
      throw new BadRequestException({
        code: EXCEPTION_CODE.USER.WRONG_PASSWORD,
        message: 'Password is incorrect',
      });
    }

    const passwordHash = await this.hashPassword(changePassword.new_password);
    user['password'] = passwordHash;
    const result = await this.usersService.updatePassword(user);

    return {
      success: result,
    };
  }

  async sendPasswordReset(
    forgotPassword: ForgotPasswordDto,
  ): Promise<UpdateResult> {
    const { email } = forgotPassword;
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.USER.EMAIL_NOT_FOUND,
        message: 'Email not found',
      });
    }

    const expiresIn = '1h';
    const reset_token_expiry = new Date(Date.now() + 3600000);
    const token = await this.jwtService.signAsync(
      { email, reset_token_expiry },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn,
      },
    );

    // Save the token or a hash of it to validate later
    const hashedToken = await this.hashPassword(token);
    await this.usersService.updateResetToken(
      user._id.toString(),
      hashedToken,
      reset_token_expiry,
    );

    const result = await this.mailService.sendPasswordReset(
      forgotPassword.email,
      token,
      expiresIn,
    );

    return {
      success: result,
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<UpdateResult> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      const userFound = await this.usersService.findUserByEmail(decoded.email);
      if (!userFound) {
        throw new NotFoundException({
          code: EXCEPTION_CODE.USER.EMAIL_NOT_FOUND,
          message: 'Email not found',
        });
      }

      const isValid = await this.validatePassword(token, userFound.reset_token);

      if (
        !isValid ||
        new Date(decoded.reset_token_expiry).toISOString() !==
          userFound.reset_token_expiry.toISOString()
      ) {
        throw new BadRequestException({
          code: EXCEPTION_CODE.USER.INVALID_RESET_TOKEN,
          message: 'Invalid reset token',
        });
      }

      const passwordHash = await this.hashPassword(newPassword);
      const user: User = {
        id: userFound._id,
        password: passwordHash,
        reset_token: null,
        reset_token_expiry: null,
      } as unknown as User;

      const result = await this.usersService.updatePassword(user);

      return {
        success: result,
        message: 'Password changed successfully',
      };
    } catch (error) {
      throw new BadRequestException({
        code: EXCEPTION_CODE.USER.INVALID_RESET_TOKEN,
        message: 'Invalid or expired token',
      });
    }
  }

  async register(register: RegisterDto) {
    const newUser: CreateUserDto = {
      ...register,
      role: ERole.USER,
      is_delete_avatar: false,
      is_active: true,
    } as CreateUserDto;
    return await this.usersService.create(newUser);
  }

  async changeAvatar(
    userId: string,
    avatar: Express.Multer.File,
  ): Promise<UpdateResult> {
    const userFound = await this.usersService.findById(userId);
    if (!userFound) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.USER.ID_NOT_FOUND,
        message: 'id user not found',
      });
    }

    const dataUpload = await this.imageStorageService.upload(avatar);
    userFound.avatar_url = dataUpload.url;
    userFound.avatar_public_id = dataUpload.public_id;

    return await this.usersService.updateUser(userFound);
  }

  // METHODS
  async generateTokens(user: User): Promise<IUserToken> {
    const tokens = await Promise.all([
      this.jwtService.signAsync(
        { user },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_ACCESS_SECRET_EXPIRES',
          ),
        },
      ),

      this.jwtService.signAsync(
        { user },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_REFRESH_SECRET_EXPIRES',
          ),
        },
      ),
    ]);

    return {
      access_token: tokens[0],
      refresh_token: tokens[1],
    };
  }

  async hashPassword(password: string): Promise<string> {
    const saltLength = +(this.configService.get<string>('BCRYPT_SALT') || 12);
    return await bcrypt.hash(password, saltLength);
  }

  randomPassword(): string {
    const chars =
      '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const passwordLength = 12;
    let password = '';

    for (let i = 0; i <= passwordLength; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber + 1);
    }

    return password;
  }

  private async validatePassword(
    password: string,
    storedPasswordHash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, storedPasswordHash);
  }
}
