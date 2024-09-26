import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { instanceToPlain } from 'class-transformer';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

import { IConversationsService } from '../conversations/conversations';
import { ConversationNotFoundException } from '../conversations/exceptions/ConversationNotFound';
import { FriendNotFoundException } from '../friends/exceptions/FriendNotFound';
import { IFriendsService } from '../friends/friends';
import { IMessageAttachmentsService } from '../message-attachments/message-attachments';
// import { buildFindMessageParams } from '@/utils/builders';
import { Services } from '@/constants/constants';
import {
  CreateMessageParams,
  CreateMessageResponse,
  DeleteMessageParams,
  EditMessageParams,
} from '@/utils/types';
import { CannotCreateMessageException } from './exceptions/CannotCreateMessage';
import { CannotDeleteMessage } from './exceptions/CannotDeleteMessage';
import { IMessageService } from './message';
import { Message } from './entities/message.entity';
import { Conversation } from '../conversations/entities/conversation.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class MessageService implements IMessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @Inject(Services.CONVERSATIONS)
    private readonly conversationService: IConversationsService,
    @Inject(Services.MESSAGE_ATTACHMENTS)
    private readonly messageAttachmentsService: IMessageAttachmentsService,
    @Inject(Services.FRIENDS_SERVICE)
    private readonly friendsService: IFriendsService,
    private readonly userService: UsersService,
  ) {}
  async createMessage(
    params: CreateMessageParams,
  ): Promise<CreateMessageResponse> {
    const { user_id, content, id } = params;
    const conversation = await this.conversationService.findById(id);
    if (!conversation) throw new ConversationNotFoundException();

    // const { creator, recipient } = conversation;
    const { creator_id, recipient_id } = conversation;

    if (!creator_id || !recipient_id) throw new CannotCreateMessageException();
    const isFriends = await this.friendsService.isFriends(
      creator_id,
      recipient_id,
    );
    if (!isFriends) throw new FriendNotFoundException();
    if (creator_id !== user_id && recipient_id !== user_id)
      throw new CannotCreateMessageException();

    const message = this.messageRepository.create({
      content,
      conversation_id: conversation._id.toString(),
      author_id: user_id,
      // attachments_ids: params.attachments
      //   ? await this.messageAttachmentsService.create(params.attachments)
      //   : [],
    });
    const savedMessage = await this.messageRepository.save(message);
    conversation.lastMessageSent = savedMessage;
    const updated = await this.conversationService.save(conversation);

    // relation: author, conversation
    if (savedMessage) {
      // author
      const authorFound = await this.userService.findById(
        savedMessage.author_id,
      );
      savedMessage.author = authorFound || null;

      // conversation
      const conversationFound = await this.conversationService.findById(
        savedMessage.conversation_id,
      );
      if (conversationFound) savedMessage.conversation = conversationFound;
    }

    return { message: savedMessage, conversation: updated };
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const messagesFound = await this.messageRepository.find({
      // relations: ['author', 'attachments', 'author.profile'],
      where: { conversation_id: conversationId },
      order: { created_at: 'DESC' },
    });

    if (messagesFound.length > 0) {
      await Promise.all(
        messagesFound.map(async (message) => {
          // relation: author
          const authorFound = await this.userService.findById(
            message.author_id,
          );
          message.author = authorFound || null;

          // relation: attachment
          // const attachmentFound = await this.messageAttachmentsService.findById(
          //   message.attachments_id,
          // );
          // message.attachments = authorFound || null;
        }),
      );
    }

    return messagesFound;
  }

  async deleteMessage(params: DeleteMessageParams) {
    const { conversationId } = params;
    const msgParams = { id: conversationId, limit: 5 };
    const conversation = await this.conversationService.getMessages(msgParams);
    if (!conversation) throw new ConversationNotFoundException();

    // const findMessageParams = buildFindMessageParams(params);
    const message = await this.messageRepository.findOne({
      where: {
        _id: new ObjectId(params.messageId),
        author_id: params.userId,
        conversation_id: params.conversationId,
      },
    });
    if (!message) throw new CannotDeleteMessage();
    if (conversation.lastMessageSent_id !== message._id.toString())
      return this.messageRepository.delete(message._id.toString());
    return this.deleteLastMessage(conversation, message);
  }

  async deleteLastMessage(conversation: Conversation, message: Message) {
    const size = conversation.messages.length;
    const SECOND_MESSAGE_INDEX = 1;
    if (size <= 1) {
      console.log('Last Message Sent is deleted');
      await this.conversationService.update({
        id: conversation._id.toString(),
        lastMessageSent_id: null,
      });
      return this.messageRepository.delete(message._id.toString());
    } else {
      console.log('There are more than 1 message');
      const newLastMessage = conversation.messages[SECOND_MESSAGE_INDEX];
      await this.conversationService.update({
        id: conversation._id.toString(),
        lastMessageSent_id: newLastMessage._id.toString(),
      });
      return this.messageRepository.delete(message._id.toString());
    }
  }

  async editMessage(params: EditMessageParams) {
    const messageDB = await this.messageRepository.findOne({
      where: {
        _id: new ObjectId(params.messageId),
        author_id: params.userId,
      },
      // relations: [
      //   'conversation',
      //   'conversation.creator',
      //   'conversation.recipient',
      //   'author',
      //   'author.profile',
      // ],
    });
    if (!messageDB)
      throw new HttpException('Cannot Edit Message', HttpStatus.BAD_REQUEST);

    messageDB.content = params.content;
    return this.messageRepository.save(messageDB);
  }
}
