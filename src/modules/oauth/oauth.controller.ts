import {
  Controller,
  Get,
  Request,
  Query,
  UseGuards,
  Res,
  Post,
  Body,
} from '@nestjs/common';

import { EXCEPTION_CODE } from '@/constants/exceptionCode';
import { OauthService } from './oauth.service';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { Response } from 'express';
import { IUserToken } from '../auth/interfaces/auth.interface';
import { OauthLoginAppDto } from './dtos/OauthLogin.dto';

@Controller('oauth')
export class OauthController {
  constructor(private oauthService: OauthService) {}

  // oauth Google
  @Get('google')
  async oauthGoogle(
    @Request() req: Request,
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let host: string = req.headers?.host;
    if (host.includes('localhost')) {
      host = 'http://' + host;
    } else {
      host = 'https://' + host;
    }

    const redirectUri = `${host}${process.env.API_PREFIX}/oauth/google`;
    const webLoginUrl = `${process.env.WEB_URL}/auth/login`;

    try {
      const tokens = await this.oauthService.oauthGoogle(code, redirectUri);
      const { access_token, refresh_token } = tokens;
      const query = `access_token=${access_token}&refresh_token=${refresh_token}`;
      const url = `${webLoginUrl}?${query}`;

      res.redirect(301, url);
    } catch (error) {
      const code = error?.response?.code;

      switch (code) {
        case EXCEPTION_CODE.OAUTH.CODE_NOT_FOUND:
          res.redirect(
            301,
            `${webLoginUrl}?code=${EXCEPTION_CODE.OAUTH.CODE_NOT_FOUND}`,
          );
          break;

        case EXCEPTION_CODE.USER.EMAIL_NOT_FOUND:
          res.redirect(
            301,
            `${webLoginUrl}?code=${EXCEPTION_CODE.USER.EMAIL_NOT_FOUND}`,
          );
          break;

        default:
          res.redirect(301, `${webLoginUrl}?oauth-error`);
          break;
      }
    }
  }

  @Post('google/app')
  async oauthGoogleApp(
    @Body() oauthLoginAppDto: OauthLoginAppDto,
  ): Promise<IUserToken> {
    return await this.oauthService.oauthGoogleApp(oauthLoginAppDto);
  }

  // use guard ???
  @Get('google/guard')
  @UseGuards(GoogleOauthGuard)
  async googleAuth() {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(@Request() req: Request, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let host: string = req.headers?.host;
    if (host.includes('localhost')) {
      host = 'http://' + host;
    } else {
      host = 'https://' + host;
    }

    const webLoginUrl = `${process.env.WEB_URL}/auth/login`;

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const tokens = await this.oauthService.oauthLoginCallback(req.user);
      const { access_token, refresh_token } = tokens;
      const query = `access_token=${access_token}&refresh_token=${refresh_token}`;
      const url = `${webLoginUrl}?${query}`;

      res.redirect(301, url);
    } catch (error) {
      const code = error?.response?.code;

      switch (code) {
        case EXCEPTION_CODE.OAUTH.CODE_NOT_FOUND:
          res.redirect(
            301,
            `${webLoginUrl}?code=${EXCEPTION_CODE.OAUTH.CODE_NOT_FOUND}`,
          );
          break;

        case EXCEPTION_CODE.USER.EMAIL_NOT_FOUND:
          res.redirect(
            301,
            `${webLoginUrl}?code=${EXCEPTION_CODE.USER.EMAIL_NOT_FOUND}`,
          );
          break;

        default:
          res.redirect(301, `${webLoginUrl}?oauth-error`);
          break;
      }
    }
  }
}
