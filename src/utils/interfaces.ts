import { User } from '@/modules/users/entity/user.entity';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  user?: User;
}
