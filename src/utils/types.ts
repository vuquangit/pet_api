import { Request } from 'express';

import { User } from '@/modules/users/entity/user.entity';
import { Friend } from '@/modules/friends/entities/friend.entity';
import { Message } from '@/modules/messages/entities/message.entity';
import { Conversation } from '@/modules/conversations/entities/conversation.entity';
import { GroupMessage } from '@/modules/groups/entities/GroupMessage';
import { Group } from '@/modules/groups/entities/Group';
import { GroupMessageAttachment } from '@/modules/groups/entities/GroupMessageAttachment';
import { MessageAttachment } from '@/modules/message-attachments/entities/MessageAttachment';

export type CreateUserDetails = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type ValidateUserDetails = {
  username: string;
  password: string;
};

export type FindUserParams = Partial<{
  id: number;
  email: string;
  username: string;
}>;

export type FindUserOptions = Partial<{
  selectAll: boolean;
}>;

export type CreateConversationParams = {
  // username: string;
  user_id: string;
  message: string;
};

export type ConversationIdentityType = 'author' | 'recipient';

export type FindParticipantParams = Partial<{
  id: number;
}>;

export interface AuthenticatedRequest extends Request {
  user: User;
}

export type CreateParticipantParams = {
  id: number;
};

export type CreateMessageParams = {
  id: string;
  content?: string;
  // attachments?: Attachment[];
  // user: User;
  // attachments_ids?: Attachment[];
  user_id: string;
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

export type FindMessageParams = {
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

export type CreateGroupParams = {
  creator: User;
  title?: string;
  users: string[];
};

export type FetchGroupsParams = {
  userId: string;
};

export type CreateGroupMessageParams = {
  author: User;
  attachments?: Attachment[];
  content: string;
  groupId: string;
};

export type CreateGroupMessageResponse = {
  message: GroupMessage;
  group: Group;
};

export type DeleteGroupMessageParams = {
  userId: string;
  groupId: string;
  messageId: string;
};

export type AddGroupRecipientParams = {
  id: string;
  // username: string;
  add_user_id: string;
  userId: string;
};

export type RemoveGroupRecipientParams = {
  id: string;
  removeUserId: string;
  issuerId: string;
};

export type AddGroupUserResponse = {
  group: Group;
  user: User;
};

export type RemoveGroupUserResponse = {
  group: Group;
  user: User;
};

export type AccessParams = {
  id: string;
  userId: string;
};

export type TransferOwnerParams = {
  userId: string;
  groupId: string;
  newOwnerId: string;
};

export type LeaveGroupParams = {
  id: string;
  userId: string;
};

export type CheckUserGroupParams = {
  id: string;
  userId: string;
};

export type DeleteFriendRequestParams = {
  id: string;
  userId: string;
};

export type RemoveFriendEventPayload = {
  friend: Friend;
  userId: string;
};

export type UserProfileFiles = Partial<{
  banner: Express.Multer.File[];
  avatar: Express.Multer.File[];
}>;

export type UpdateUserProfileParams = Partial<{
  about: string;
  banner: Express.Multer.File;
  avatar: Express.Multer.File;
}>;

export type ImagePermission = 'public-read' | 'private';
export type UploadImageParams = {
  key: string;
  file: Express.Multer.File;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Attachment extends Express.Multer.File {}

export type UploadMessageAttachmentParams = {
  file: Attachment;
  messageAttachment: MessageAttachment;
};

export type UploadGroupMessageAttachmentParams = {
  file: Attachment;
  messageAttachment: GroupMessageAttachment;
};

export type GetConversationMessagesParams = {
  id: string;
  limit: number;
};

export type UpdateConversationParams = Partial<{
  id: string;
  // lastMessageSent: Message;
  lastMessageSent_id: string | null;
}>;

export type UserPresenceStatus = 'online' | 'away' | 'offline' | 'dnd';

export type UpdateStatusMessageParams = {
  user: User;
  statusMessage: string;
};

export type CallHangUpPayload = {
  receiver: User;
  caller: User;
};

export type VoiceCallPayload = {
  conversationId: string;
  recipientId: string;
};

export type CallAcceptedPayload = {
  caller: User;
};

export type UpdateGroupDetailsParams = {
  id: string;
  title?: string;
  avatar?: Attachment;
};
