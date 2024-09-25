// import { Conversation, User } from '@/utils/typeorm';
import {
  AccessParams,
  CreateConversationParams,
  GetConversationMessagesParams,
  UpdateConversationParams,
} from '@/utils/types';
import { Conversation } from '@/modules/conversations/entities/conversation.entity';
import { User } from '@/modules/users/entities/user.entity';

export interface IConversationsService {
  createConversation(
    user: User,
    conversationParams: CreateConversationParams,
  ): Promise<Conversation>;
  getConversations(id: string): Promise<Conversation[]>;
  findById(id: string): Promise<Conversation | null>;
  hasAccess(params: AccessParams): Promise<boolean>;
  // isCreated(userId: string, recipientId: string): Promise<Conversation | null>;
  isCreated(userId: string, recipientId: string): Promise<boolean>;
  save(conversation: Conversation): Promise<Conversation>;
  getMessages(params: GetConversationMessagesParams): Promise<Conversation>;
  update(params: UpdateConversationParams): any;
}
