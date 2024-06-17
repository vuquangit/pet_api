import { AUTH_GUARD_TYPES } from '@/constants/authGuard';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { EXCEPTION_CODE } from '@/constants/exceptionCode';

@Injectable()
export class GoogleOauthGuard extends AuthGuard(AUTH_GUARD_TYPES.GOOGLE) {
  getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }

  handleRequest(err: any, user: any) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException({
          message: {
            code: EXCEPTION_CODE.OAUTH.ERROR,
            message: 'Oauth error',
          },
        })
      );
    }
    return user;
  }
}
