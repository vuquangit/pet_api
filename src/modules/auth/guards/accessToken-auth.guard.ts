import { AUTH_GUARD_TYPES } from '@/constants/authGuard';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { EXCEPTION_CODE } from '@/constants/exceptionCode';

@Injectable()
export class AccessTokenGuard extends AuthGuard(AUTH_GUARD_TYPES.ACCESS_TOKEN) {
  getRequest(context: ExecutionContext) {
    const contextType = context.getType();

    // http
    if (contextType !== 'ws') return context.switchToHttp().getRequest();

    // websocket
    const ws = context.switchToWs().getClient(); // possibly `getData()` instead.
    const headers = ws.handshake.headers;
    return {
      headers,
    };
  }

  handleRequest(err: any, user: any) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException({
          message: {
            code: EXCEPTION_CODE.AUTH.ACCESS_TOKEN_EXPIRED,
            message: 'Token expired',
          },
        })
      );
    }
    return user;
  }
}
