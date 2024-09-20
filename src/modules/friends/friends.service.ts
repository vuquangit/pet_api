import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Friend } from './entities/friend.entity';
import { DeleteFriendRequestParams } from './interfaces/friend.interface';
import { DeleteFriendException } from './exceptions/DeleteFriend';
import { FriendNotFoundException } from './exceptions/FriendNotFound';
import { ObjectId } from 'mongodb';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendsRepository: Repository<Friend>,
    private readonly userService: UsersService,
  ) {}

  async getFriends(id: string): Promise<Friend[]> {
    console.log('getFriends', id);
    // return this.friendsRepository.find({
    // where: [{ sender: { id } }, { receiver: { id } }],
    // relations: [
    //   'sender',
    //   'receiver',
    //   'sender.profile',
    //   'receiver.profile',
    //   'receiver.presence',
    //   'sender.presence',
    // ],
    // });

    const friend_1 = await this.friendsRepository.find({
      where: { sender_id: id },
    });
    // relations
    if (friend_1.length > 0) {
      await Promise.all(
        friend_1.map(async (friend) => {
          const userSenderFound = await this.userService.findById(
            friend.sender_id,
          );
          const userReceiverFound = await this.userService.findById(
            friend.receiver_id,
          );
          friend.sender = userSenderFound;
          friend.receiver = userReceiverFound;
        }),
      );
    }

    const friend_2 = await this.friendsRepository.find({
      where: { receiver_id: id },
    });
    // relations
    if (friend_2.length > 0) {
      await Promise.all(
        friend_2.map(async (friend) => {
          const userSenderFound = await this.userService.findById(
            friend.sender_id,
          );
          const userReceiverFound = await this.userService.findById(
            friend.receiver_id,
          );
          friend.sender = userSenderFound;
          friend.receiver = userReceiverFound;
        }),
      );
    }

    const friendList = [...friend_1, ...friend_2];

    return friendList;
  }

  async findFriendById(id: string): Promise<Friend | null> {
    // return this.friendsRepository.findOne(id, {
    //   relations: [
    //     'sender',
    //     'receiver',
    //     'sender.profile',
    //     'sender.presence',
    //     'receiver.profile',
    //     'receiver.presence',
    //   ],
    // });
    return await this.friendsRepository.findOneBy({
      _id: new ObjectId(id),
    });
  }

  async deleteFriend({ id, userId }: DeleteFriendRequestParams) {
    const friend = await this.findFriendById(id);
    if (!friend) throw new FriendNotFoundException();

    console.log(friend, userId);
    if (friend.receiver_id !== userId && friend.sender_id !== userId)
      throw new DeleteFriendException();

    await this.friendsRepository.delete(id);
    return friend;
  }

  async isFriends(userOneId: string, userTwoId: string): Promise<boolean> {
    const friend_1 = await this.friendsRepository.findOne({
      where: {
        sender_id: userOneId,
        receiver_id: userTwoId,
      },
    });
    const friend_2 = await this.friendsRepository.findOne({
      where: {
        sender_id: userTwoId,
        receiver_id: userOneId,
      },
    });

    const friend = [friend_1, friend_2].filter(Boolean);
    return friend.length > 0;
  }
}
