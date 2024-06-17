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
} from '@nestjs/common';

import { LoginUserDto } from '@/modules/auth/dtos/LoginUser.dto';
import { ChangePasswordDto } from '@/modules/auth/dtos/ChangePassword.dto';
import { ForgotPasswordDto } from '@/modules/auth/dtos/ForgotPassword.dto';

import { UsersService } from '@/modules/users/users.service';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';
import { RefreshTokenGuard } from '@/modules/auth/guards/refreshToken-auth.guard';
import { User } from '@/modules/users/entity/user.entity';
import { IUserToken } from './interfaces/auth.interface';
import { UpdateResult } from '@/common/interfaces/common.interface';

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
    const id = req.user._id.toString();
    return await this.userService.findById(id);
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
}
