import { Message } from '@/modules/messages/entities/message.entity';
import { Conversation } from '@/modules/conversations/entities/conversation.entity';

export type CreateMessageParams = {
  id: string;
  content?: string;
  user_id: string;
  // attachments_ids?: Attachment[];
};

export type CreateMessageResponse = {
  message: Message;
  conversation: Conversation;
};

export type DeleteMessageParams = {
  userId: string;
  conversationId: string;
  messageId: string;
};

export type EditMessageParams = {
  conversationId: string;
  messageId: string;
  userId: string;
  content: string;
};

export type EditGroupMessageParams = {
  groupId: string;
  messageId: string;
  userId: string;
  content: string;
};
