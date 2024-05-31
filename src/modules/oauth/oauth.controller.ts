import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { OauthLoginEmailDto } from '@/modules/oauth/dtos/OauthLogin.dto';
import { EXCEPTION_CODE } from '@/constants/exceptionCode';
import { OauthService } from './oauth.service';

@Controller('oauth')
export class OauthController {
  constructor(private oauthService: OauthService) {}

  @Get('google')
  @HttpCode(200)
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

    try {
      const tokens = await this.oauthService.oauthGoogle(code, redirectUri);
      const { access_token, refresh_token } = tokens;
      const query = `access_token=${access_token}&refresh_token=${refresh_token}`;
      const url = `${process.env.WEB_URL}/login?${query}`;

      res.redirect(301, url);
    } catch (error) {
      const code = error?.response?.code;
      const url = `${process.env.WEB_URL}/login`;

      switch (code) {
        case EXCEPTION_CODE.OAUTH.CODE_NOT_FOUND:
          res.redirect(
            301,
            `${url}?code=${EXCEPTION_CODE.OAUTH.CODE_NOT_FOUND}`,
          );
          break;

        case EXCEPTION_CODE.USER.EMAIL_NOT_FOUND:
          res.redirect(
            301,
            `${url}?code=${EXCEPTION_CODE.USER.EMAIL_NOT_FOUND}`,
          );
          break;

        default:
          res.redirect(301, `${url}?oauth-error`);
          break;
      }
    }
  }

  @Post('google')
  @HttpCode(200)
  async oauthLoginByAuth(@Body() data: OauthLoginEmailDto) {
    return await this.oauthService.oauthLoginByAuth(data);
  }
}
