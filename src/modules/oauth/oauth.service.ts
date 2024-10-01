import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { EXCEPTION_CODE } from '@/constants/exceptionCode';
import { IUserToken } from '@/modules/auth/interfaces/auth.interface';
import { UsersService } from '@/modules/users/services/users.service';
import { AuthService } from '@/modules/auth/auth.service';
import { User } from '@/modules/users/entities/user.entity';
import { OauthLoginAppDto } from './dtos/OauthLogin.dto';

@Injectable()
export class OauthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  // oauth Google
  private getOauthGoogleToken = async (code: string, redirectUri: string) => {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };

    try {
      const res = await this.httpService.axiosRef.post(
        `https://oauth2.googleapis.com/token`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return res?.data;
    } catch (err) {
      console.log(err?.message + ': ' + JSON.stringify(err?.response?.data));
    }
  };

  private getGoogleUser = async ({
    id_token,
    access_token,
  }: {
    id_token: string;
    access_token: string;
  }) => {
    try {
      const res = await this.httpService.axiosRef.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}&alt=json`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        },
      );
      return res?.data;
    } catch (err) {
      console.log(err?.message + ': ' + JSON.stringify(err?.response?.data));
    }
  };

  async oauthGoogle(code: string, redirectUri: string): Promise<IUserToken> {
    if (!code) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.OAUTH.CODE_NOT_FOUND,
        message: 'Code not found',
      });
    }

    const dataToken = await this.getOauthGoogleToken(code, redirectUri);
    const { id_token = '', access_token = '' } = dataToken;
    if (!id_token) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.OAUTH.CODE_NOT_FOUND,
        message: 'token not found',
      });
    }

    const googleUser = await this.getGoogleUser({ id_token, access_token });
    if (!googleUser?.verified_email) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.USER.EMAIL_NOT_FOUND,
        message: 'Email not found',
      });
    }

    const email = googleUser.email;
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.USER.EMAIL_NOT_FOUND,
        message: 'Email not found',
      });
    }

    return await this.authService.generateTokens(user);
  }

  async oauthGoogleApp(tokens: OauthLoginAppDto): Promise<IUserToken> {
    const googleUser = await this.getGoogleUser(tokens);
    if (!googleUser?.verified_email) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.USER.EMAIL_NOT_FOUND,
        message: 'Email not found',
      });
    }

    const email = googleUser.email;
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.USER.EMAIL_NOT_FOUND,
        message: 'Email not found',
      });
    }

    return await this.authService.generateTokens(user);
  }

  async oauthLoginCallback(user: any): Promise<IUserToken> {
    if (!user?.email) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.USER.EMAIL_NOT_FOUND,
        message: 'Email not found',
      });
    }

    return await this.authService.generateTokens(user);
  }

  async validateUser(profile: any): Promise<User | null> {
    // Implement your user validation logic here
    // Typically, you'd check if the user exists in your database and create one if not
    const _email = profile?.emails[0]?.value;
    return await this.userService.findUserByEmail(_email);
  }
}
