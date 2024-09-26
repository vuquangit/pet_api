import { User } from '@/modules/users/entities/user.entity';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { AuthenticatedRequest } from './types';

export interface AuthenticatedRequest extends Request {
  user: User;
}

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = <AuthenticatedRequest>ctx.switchToHttp().getRequest();
    return request.user;
  },
);
