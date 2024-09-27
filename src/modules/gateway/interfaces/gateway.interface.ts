import { Socket } from 'socket.io';
import { User } from '@/modules/users/entities/user.entity';

export interface AuthenticatedSocket extends Socket {
  user?: User;
}

export interface CallHangUpPayload {
  receiver: User;
  caller: User;
}

export interface VoiceCallPayload {
  conversationId: string;
  recipientId: string;
}

export interface CallAcceptedPayload {
  caller: User;
}
