/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Request,
  UseGuards,
  Delete,
  Put,
  Query,
  Res,
  UseInterceptors,
  ParseIntPipe,
  UploadedFile,
  ParseBoolPipe,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { UpdateResult } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';

import { CreateUserDto } from '@/modules/users/dtos/CreateUser.dto';
import { LoginUserDto } from '@/modules/users/dtos/LoginUser.dto';
import { ChangePasswordDto } from '@/modules/users/dtos/ChangePassword.dto';
import { ForgotPasswordDto } from '@/modules/users/dtos/ForgotPassword.dto';
import { OauthLoginEmailDto } from '@/modules/users/dtos/OauthLogin.dto';

import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';
import { IUserToken } from '@/modules/users/interfaces/user.interface';
import { UsersService } from '@/modules/users/users.service';
import { RefreshTokenGuard } from '@/modules/auth/guards/refreshToken-auth.guard';
import { User } from '@/modules/users/entity/user.entity';
import { EXCEPTION_CODE } from '@/constants/exceptionCode';
import { PageDto } from '@/common/dtos/page.dto';

@Controller()
export class UsersController {
  constructor(private userService: UsersService) {}

  // USERS
  @UseGuards(AccessTokenGuard)
  @Post('user')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fieldSize: 5120,
      },
    }),
  )
  create(
    @Body() createdUserDto: CreateUserDto,
    @UploadedFile() avatar: any,
    @Body('role', ParseIntPipe) role: number,
    @Body('is_active', ParseBoolPipe) is_active: boolean,
  ): Observable<User> {
    return this.userService.create({
      ...createdUserDto,
      role,
      avatar,
      is_active,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Get('users')
  findAll(
    @Query() query?: any,
    @Request() req?: any,
  ): Observable<PageDto<User[]>> {
    const user = req.user;
    return this.userService.findAllByQuery(query, user);
  }

  @UseGuards(AccessTokenGuard)
  @Get('user/:id')
  findUser(
    @Param('id') id: string,
    @Query('include') include: string,
  ): Observable<User | null> {
    return this.userService.findById(id, include);
  }

  @UseGuards(AccessTokenGuard)
  @Put('user/:id')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fieldSize: 5120,
      },
    }),
  )
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: CreateUserDto,
    @UploadedFile() avatar: any,
    @Body('role', ParseIntPipe) role: any,
    @Body('is_active', ParseBoolPipe) is_active: boolean,
    @Body('is_delete_avatar', ParseBoolPipe) is_delete_avatar: boolean,
  ): Observable<UpdateResult> {
    return this.userService.update(id, {
      ...updateUserDto,
      role,
      avatar,
      is_active,
      is_delete_avatar,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Delete('user/:id')
  remove(@Param('id') id: string): Observable<any> {
    return this.userService.remove(id);
  }

  //
  // AUTH
  @UseGuards(AccessTokenGuard)
  @Get('auth/profile')
  getProfile(@Request() req: any) {
    // return req.user;
    const id = req.user.id;
    return this.userService.findById(id);
  }

  @Post('auth/login')
  @HttpCode(200)
  login(@Body() loginUserDto: LoginUserDto): Observable<object> {
    return this.userService.login(loginUserDto).pipe(
      map((tokens: IUserToken) => {
        return {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        };
      }),
    );
  }

  // @UseGuards(AccessTokenGuard)
  // @Post('auth/change-password')
  // @HttpCode(200)
  // changePassword(
  //   @Request() req: any,
  //   @Body() changePasswordDto: ChangePasswordDto,
  // ): any {
  //   const user = req.user;
  //   return this.userService.changePassword(user, changePasswordDto);
  // }

  // @Post('auth/forgot-password')
  // @HttpCode(200)
  // forgotPassword(
  //   @Body() forgotPasswordDto: ForgotPasswordDto,
  // ): Observable<boolean> {
  //   return this.userService.forgotPassword(forgotPasswordDto);
  // }

  // @UseGuards(AccessTokenGuard)
  // @Get('auth/logout')
  // logout(@Request() req: any) {
  //   this.authService.logout(req.user);
  // }

  @UseGuards(RefreshTokenGuard)
  @Post('auth/refresh-token')
  @HttpCode(200)
  refreshToken(@Request() req: { user: User }): any {
    const user = req.user;
    return this.userService.refreshToken(user);
  }

  // // oauth Google
  // @Get('oauth/google')
  // @HttpCode(200)
  // async oauthGoogle(
  //   @Request() req: Request,
  //   @Query('code') code: string,
  //   @Res() res: Response,
  // ) {
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   let host: string = req.headers?.host;
  //   if (host.includes('localhost')) {
  //     host = 'http://' + host;
  //   } else {
  //     host = 'https://' + host;
  //   }

  //   const redirectUri = `${host}${process.env.API_PREFIX}/oauth/google`;

  //   try {
  //     const tokens = await this.userService.oauthGoogle(code, redirectUri);
  //     const { accessToken, refreshToken } = tokens;
  //     const query = `access_token=${accessToken}&refresh_token=${refreshToken}`;
  //     const url = `${process.env.FRONT_END_HOSTING_PATH}/login?${query}`;

  //     res.redirect(301, url);
  //   } catch (error) {
  //     const code = error?.response?.code;
  //     const url = `${process.env.FRONT_END_HOSTING_PATH}/login`;

  //     switch (code) {
  //       case EXCEPTION_CODE.OAUTH.CODE_NOT_FOUND:
  //         res.redirect(
  //           301,
  //           `${url}?code=${EXCEPTION_CODE.OAUTH.CODE_NOT_FOUND}`,
  //         );
  //         break;

  //       case EXCEPTION_CODE.USER.EMAIL_NOT_FOUND:
  //         res.redirect(
  //           301,
  //           `${url}?code=${EXCEPTION_CODE.USER.EMAIL_NOT_FOUND}`,
  //         );
  //         break;

  //       default:
  //         res.redirect(301, `${url}?oauth-error`);
  //         break;
  //     }
  //   }
  // }

  // // @UseGuards(AccessTokenGuard)
  // @Post('oauth/google')
  // @HttpCode(200)
  // async oauthLoginByAuth(@Body() data: OauthLoginEmailDto) {
  //   return await this.userService.oauthLoginByAuth(data);
  // }
}
