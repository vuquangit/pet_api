import { AUTH_GUARD_TYPES } from '@/constants/authGuard';
import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenGuard extends AuthGuard(
  AUTH_GUARD_TYPES.REFRESH_TOKEN,
) {
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
      throw err || new BadRequestException('REFRESH_TOKEN_EXPIRED');
    }
    return user;
  }
}
