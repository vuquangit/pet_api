import { User } from '@/modules/users/entities/user.entity';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  user?: User;
}
