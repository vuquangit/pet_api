import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { User } from '@/modules/users/entities/user.entity';
import { AUTH_GUARD_TYPES } from '@/constants/authGuard';

interface JwtPayload {
  user: User;
  iat: number;
  exp: number;
}

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  AUTH_GUARD_TYPES.ACCESS_TOKEN,
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = payload.user;
    if (!user) {
      throw new UnauthorizedException('Access token is expired!');
    }

    return user;
  }
}
