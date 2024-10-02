import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FriendNotFoundException } from '@/modules/friends/exceptions/FriendNotFound';
import { IFriendsService } from '@/modules/friends/friends';
import { UserNotFoundException } from '@/modules/users/exceptions/UserNotFound';
import { Services } from '@/constants/constants';
import { Message } from '@/modules/messages/entities/message.entity';
import { UsersService } from '@/modules/users/services/users.service';

import { IConversationsService } from './conversations';
import { ConversationExistsException } from './exceptions/ConversationExists';
import { ConversationNotFoundException } from './exceptions/ConversationNotFound';
import { CreateConversationException } from './exceptions/CreateConversation';
import { Conversation } from './entities/conversation.entity';
import { ObjectId } from 'mongodb';
import { User } from '../users/entities/user.entity';
import {
  CreateConversationParams,
  GetConversationMessagesParams,
  UpdateConversationParams,
} from './interfaces/conversation.interface';
import { AccessParams } from '../groups/interfaces/group';
// import { getMeta } from '@/utils/pagination';
// import { PageDto } from '@/common/dtos/page.dto';

@Injectable()
export class ConversationsService implements IConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UsersService,
    @Inject(Services.FRIENDS_SERVICE)
    private readonly friendsService: IFriendsService,
  ) {}

  async getConversations(id: string): Promise<Conversation[]> {
    // TODO
    // return this.conversationRepository
    //   .createQueryBuilder('conversation')
    //   .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
    //   .leftJoinAndSelect('conversation.creator', 'creator')
    //   .leftJoinAndSelect('conversation.recipient', 'recipient')
    //   .leftJoinAndSelect('creator.peer', 'creatorPeer')
    //   .leftJoinAndSelect('recipient.peer', 'recipientPeer')
    //   .leftJoinAndSelect('creator.profile', 'creatorProfile')
    //   .leftJoinAndSelect('recipient.profile', 'recipientProfile')
    //   .where('creator.id = :id', { id })
    //   .orWhere('recipient.id = :id', { id })
    //   .orderBy('conversation.lastMessageSentAt', 'DESC')
    //   .getMany();
    const conversationFounds = await this.conversationRepository.find({
      where: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        $or: [
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          { creator_id: id },
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          { recipient_id: id },
        ],
      },
    });

    if (conversationFounds.length > 0) {
      await Promise.all(
        conversationFounds.map(async (conversation) => {
          const creatorFound = await this.userService.findById(
            conversation.creator_id,
          );
          const recipientFound = await this.userService.findById(
            conversation.recipient_id,
          );
          conversation.creator = creatorFound;
          conversation.recipient = recipientFound;
        }),
      );
    }

    // const conversations_2 = await this.conversationRepository.find({
    //   where: {
    //     recipient_id: id,
    //   },
    // });

    // if (conversations_2.length > 0) {
    //   await Promise.all(
    //     conversations_2.map(async (conversation) => {
    //       const creatorFound = await this.userService.findById(
    //         conversation.creator_id,
    //       );
    //       const recipientFound = await this.userService.findById(
    //         conversation.recipient_id,
    //       );
    //       conversation.creator = creatorFound;
    //       conversation.recipient = recipientFound;
    //     }),
    //   );
    // }

    // return [...conversations_1, ...conversations_2];
    return conversationFounds;
  }

  async findById(id: string) {
    if (!id) throw new ConversationNotFoundException();

    const conversation = await this.conversationRepository.findOne({
      where: { _id: new ObjectId(id) },
      // relations: [
      //   'creator',
      //   'recipient',
      //   'creator.profile',
      //   'recipient.profile',
      //   'lastMessageSent',
      // ],
    });

    if (conversation) {
      const creatorFound = await this.userService.findById(
        conversation.creator_id,
      );
      const recipientFound = await this.userService.findById(
        conversation.recipient_id,
      );
      conversation.creator = creatorFound;
      conversation.recipient = recipientFound;
    }

    return conversation;
  }

  async isCreated(userId: string, recipientId: string) {
    const exists = await this.conversationRepository.find({
      where: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        $or: [
          {
            creator_id: userId,
            recipient_id: recipientId,
          },
          {
            creator_id: recipientId,
            recipient_id: userId,
          },
        ],
      },
    });

    return exists.length > 0;
  }

  async createConversation(creator: User, params: CreateConversationParams) {
    const { user_id, message: content } = params;
    const recipient = await this.userService.findById(user_id);
    if (!recipient) throw new UserNotFoundException();

    const recipientId = recipient._id.toString();
    const creatorId = creator._id.toString();
    if (creatorId === recipientId)
      throw new CreateConversationException(
        'Cannot create Conversation with yourself',
      );

    const isFriends = await this.friendsService.isFriends(
      creatorId,
      recipientId,
    );
    if (!isFriends) throw new FriendNotFoundException();
    const isExists = await this.isCreated(creatorId, recipientId);
    if (isExists) throw new ConversationExistsException();

    const newConversation = this.conversationRepository.create({
      // creator,
      creator_id: creatorId,
      // recipient,
      recipient_id: recipientId,
    });

    const conversation =
      await this.conversationRepository.save(newConversation);
    const newMessage = this.messageRepository.create({
      content,
      // conversation,
      conversation_id: conversation._id.toString(),
      // author: creator,
      author_id: creator._id.toString(),
    });
    await this.messageRepository.save(newMessage);

    return {
      ...conversation,
      creator,
      recipient,
      messages: [newMessage],
    };
  }

  async hasAccess({ id, userId }: AccessParams) {
    const conversation = await this.findById(id);
    if (!conversation) throw new ConversationNotFoundException();
    return (
      conversation.creator_id === userId || conversation.recipient_id === userId
    );
  }

  save(conversation: Conversation): Promise<Conversation> {
    return this.conversationRepository.save(conversation);
  }

  async getMessages({
    id,
    // limit,
  }: GetConversationMessagesParams): Promise<Conversation> {
    // return this.conversationRepository
    //   .createQueryBuilder('conversation')
    //   .where('id = :id', { id })
    //   .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
    //   .leftJoinAndSelect('conversation.messages', 'message')
    //   .where('conversation.id = :id', { id })
    //   .orderBy('message.createdAt', 'DESC')
    //   .limit(limit)
    //   .getOne();

    const conversationFound = await this.conversationRepository.findOneBy({
      _id: new ObjectId(id),
    });

    if (!conversationFound) throw new ConversationNotFoundException();

    return conversationFound;

    // const messages = await this.messageRepository.findOneBy({
    //    _id: new ObjectId(conversationFound.id)
    // });

    // const meta = getMeta(query, count, data.length);
    // const meta = {};

    // return {
    //   data: messages,
    //   meta,
    // };
  }

  update({ id, lastMessageSent_id }: UpdateConversationParams) {
    if (!id) throw new ConversationNotFoundException();
    return this.conversationRepository.update(id, { lastMessageSent_id });
  }
}
