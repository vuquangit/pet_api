import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
  Inject,
  forwardRef,
  UploadedFile,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { LoginUserDto } from '@/modules/auth/dtos/LoginUser.dto';
import { ChangePasswordDto } from '@/modules/auth/dtos/ChangePassword.dto';
import { ForgotPasswordDto } from '@/modules/auth/dtos/ForgotPassword.dto';

import { UsersService } from '@/modules/users/services/users.service';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';
import { RefreshTokenGuard } from '@/modules/auth/guards/refreshToken-auth.guard';
import { User } from '@/modules/users/entities/user.entity';
import { IUserToken } from './interfaces/auth.interface';
import { UpdateResult } from '@/common/interfaces/common.interface';
import { RegisterDto } from './dtos/Register.dto';
import { ProfileNotFoundException } from './exceptions/ProfileNotFoundException';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(forwardRef(() => UsersService)) private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginUserDto: LoginUserDto): Promise<IUserToken> {
    const tokens = await this.authService.login(loginUserDto);
    return tokens;
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout() {
    return await this.authService.logout();
  }

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  async getProfile(@Request() req: { user: User }): Promise<User | null> {
    try {
      const id = req.user._id.toString();
      const userFound = await this.userService.findById(id);
      if (!userFound) throw new ProfileNotFoundException();

      return userFound;
    } catch (error) {
      console.log('getProfile:', error);
      throw new ProfileNotFoundException();
    }
  }

  @UseGuards(AccessTokenGuard)
  @Post('change-password')
  @HttpCode(200)
  async changePassword(
    @Request() req: { user: User },
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<UpdateResult> {
    const user = req.user;
    return await this.authService.changePassword(user, changePasswordDto);
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<UpdateResult> {
    return await this.authService.sendPasswordReset(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('new_password') newPassword: string,
  ): Promise<UpdateResult> {
    return await this.authService.resetPassword(token, newPassword);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(@Request() req: { user: User }): Promise<IUserToken> {
    const user = req.user;
    return await this.authService.refreshToken(user);
  }

  @Post('register')
  @HttpCode(200)
  async register(@Body() registerDto: RegisterDto): Promise<any> {
    return await this.authService.register(registerDto);
  }

  @Patch('change-avatar')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fieldSize: 5120,
      },
    }),
  )
  async changeAvatar(
    @Request() req: { user: User },
    @UploadedFile() avatar: Express.Multer.File,
  ): Promise<any> {
    const user = req.user;
    const userId = user._id.toString();
    return await this.authService.changeAvatar(userId, avatar);
  }
}
