import {
  Injectable,
  // NotFoundException,
  // UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { OauthService } from '../oauth.service';
import { ConfigService } from '@nestjs/config';
import { AUTH_GUARD_TYPES } from '@/constants/authGuard';
import { EXCEPTION_CODE } from '@/constants/exceptionCode';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  AUTH_GUARD_TYPES.GOOGLE,
) {
  constructor(
    private readonly oauthService: OauthService,
    configService: ConfigService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: 'http://localhost:8080/api/v1/oauth/google/callback',
      scope: ['email', 'profile'],
      grant_type: 'authorization_code',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const user = await this.oauthService.validateUser(profile);
    if (!user) {
      // throw new NotFoundException({
      //   code: EXCEPTION_CODE.USER.EMAIL_NOT_FOUND,
      //   message: 'Validate email not found',
      // });

      // redirect
      done(null, {
        code: EXCEPTION_CODE.USER.EMAIL_NOT_FOUND,
        message: 'Validate email not found',
      });
    } else {
      done(null, user);
    }
  }
}
