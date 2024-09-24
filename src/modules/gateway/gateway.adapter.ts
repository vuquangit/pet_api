import { IoAdapter } from '@nestjs/platform-socket.io';
import {
  INestApplicationContext,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthenticatedSocket } from '@/utils/interfaces';
import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';
import { CustomSocketExceptionFilter } from './exceptions/ws-exception.filter';
import { UsersService } from '@/modules/users/users.service';

@UseFilters(CustomSocketExceptionFilter)
@UseGuards(AccessTokenGuard)
@UsePipes(new ValidationPipe())
export class WebsocketAdapter extends IoAdapter {
  private readonly jwtService: JwtService;
  private readonly usersService: UsersService;
  constructor(private app: INestApplicationContext) {
    super(app);
    this.jwtService = this.app.get(JwtService);
    this.usersService = this.app.get(UsersService);
  }

  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);

    server.use(async (socket: AuthenticatedSocket, next: any) => {
      console.log('Inside Websocket Adapter');

      const authorization = socket.handshake?.headers?.authorization || '';
      const token = authorization?.replace('Bearer ', '').replace('Bearer', '');

      if (!token || token === 'undefined') {
        console.log('Client has no token');
        return next(new Error('Not Authenticated. No token were sent'));
      }

      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      const emailUser = decoded.user.email;
      if (!emailUser) {
        return next(new Error('WS: Email not found.'));
      }
      const userFound = await this.usersService.findUserByEmail(emailUser);
      if (!userFound) {
        return next(new Error('User object does not exist.'));
      }
      socket.user = userFound;

      next();
    });
    return server;
  }
}
