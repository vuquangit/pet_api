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
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LoginUserDto } from '@/modules/auth/dtos/LoginUser.dto';
import { ChangePasswordDto } from '@/modules/auth/dtos/ChangePassword.dto';
import { ForgotPasswordDto } from '@/modules/auth/dtos/ForgotPassword.dto';

import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';
import { IUserToken } from '@/modules/auth/interfaces/auth.interface';
import { UsersService } from '@/modules/users/users.service';
import { RefreshTokenGuard } from '@/modules/auth/guards/refreshToken-auth.guard';
import { User } from '@/modules/users/entity/user.entity';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,

    private authService: AuthService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    const id = req.user.id;
    return this.userService.findById(id);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() loginUserDto: LoginUserDto): Observable<object> {
    return this.authService.login(loginUserDto).pipe(
      map((tokens: IUserToken) => {
        return {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        };
      }),
    );
  }

  // @UseGuards(AccessTokenGuard)
  // @Get('logout')
  // logout(@Request() req: any) {
  //   this.authService.logout(req.user);
  // }

  @UseGuards(AccessTokenGuard)
  @Post('change-password')
  @HttpCode(200)
  changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): any {
    const user = req.user;
    return this.authService.changePassword(user, changePasswordDto);
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.sendPasswordReset(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return await this.authService.resetPassword(token, newPassword);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  @HttpCode(200)
  refreshToken(@Request() req: { user: User }): any {
    const user = req.user;
    return this.authService.refreshToken(user);
  }
}
