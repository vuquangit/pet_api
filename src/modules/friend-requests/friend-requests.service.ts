import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

import { Services } from '@/constants/constants';
import { FriendAlreadyExists } from '@/modules/friends/exceptions/FriendAlreadyExists';
import { IFriendsService } from '@/modules/friends/friends';
import { Friend } from '@/modules/friends/entities/friend.entity';
import { UserNotFoundException } from '@/modules/users/exceptions/UserNotFound';
import { FriendRequest } from '@/modules/friend-requests/entities/friendRequest.entity';

import {
  CreateFriendParams,
  CancelFriendRequestParams,
  FriendRequestParams,
} from './interfaces/friendRequest.interface';
import { FriendRequestException } from './exceptions/FriendRequest';
import { FriendRequestAcceptedException } from './exceptions/FriendRequestAccepted';
import { FriendRequestNotFoundException } from './exceptions/FriendRequestNotFound';
import { FriendRequestPending } from './exceptions/FriendRequestPending';
import { IFriendRequestService } from './friend-requests';
import { UsersService } from '@/modules/users/services/users.service';
import { EFriendStatus } from './enums/friend.enum';

@Injectable()
export class FriendRequestService implements IFriendRequestService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>,
    private readonly userService: UsersService,
    @Inject(Services.FRIENDS_SERVICE)
    private readonly friendsService: IFriendsService,
  ) {}

  async getFriendRequests(id: string): Promise<FriendRequest[]> {
    const status = EFriendStatus.PENDING;
    const friend_1 = await this.friendRequestRepository.find({
      where: { sender_id: id, status },
    });
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

    const friend_2 = await this.friendRequestRepository.find({
      where: { receiver_id: id, status },
    });

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

  async cancel({ id, userId }: CancelFriendRequestParams) {
    const friendRequest = await this.findById(id);
    if (!friendRequest) throw new FriendRequestNotFoundException();
    if (friendRequest.sender_id !== userId) throw new FriendRequestException();
    await this.friendRequestRepository.delete(id);
    return friendRequest;
  }

  async create({ user: sender, request_id }: CreateFriendParams) {
    const receiver = await this.userService.findById(request_id);
    if (!receiver) throw new UserNotFoundException();

    const isExists = await this.isPending(
      sender._id.toString(),
      receiver._id.toString(),
    );
    if (isExists) throw new FriendRequestPending();
    if (receiver._id.toString() === sender._id.toString())
      throw new FriendRequestException('Cannot Add Yourself');

    const isFriends = await this.friendsService.isFriends(
      sender._id.toString(),
      receiver._id.toString(),
    );
    if (isFriends) throw new FriendAlreadyExists();

    const friend = this.friendRequestRepository.create({
      sender_id: sender._id.toString(),
      receiver_id: receiver._id.toString(),
      status: EFriendStatus.PENDING,
    });
    return this.friendRequestRepository.save(friend);
  }

  async accept({ id, userId }: FriendRequestParams) {
    const friendRequest = await this.findById(id);
    if (!friendRequest) throw new FriendRequestNotFoundException();
    if (friendRequest.status === EFriendStatus.ACCEPTED)
      throw new FriendRequestAcceptedException();
    if (friendRequest.receiver_id !== userId)
      throw new FriendRequestException();

    // update status
    friendRequest.status = EFriendStatus.ACCEPTED;
    await this.friendRequestRepository.update(id, friendRequest);

    // create new friend
    const newFriend = this.friendRepository.create({
      sender_id: friendRequest.sender_id,
      receiver_id: friendRequest.receiver_id,
    });
    const friend = await this.friendRepository.save(newFriend);

    return {
      friend,
      friendRequest: {
        ...friendRequest,
        status: EFriendStatus.ACCEPTED,
      },
    };
  }

  async reject({ id, userId }: CancelFriendRequestParams) {
    const friendRequest = await this.findById(id);
    if (!friendRequest) throw new FriendRequestNotFoundException();
    if (friendRequest.status === EFriendStatus.ACCEPTED)
      throw new FriendRequestAcceptedException();
    if (friendRequest.receiver_id !== userId)
      throw new FriendRequestException();

    friendRequest.status = EFriendStatus.REJECTED;
    await this.friendRequestRepository.update(id, friendRequest);
    return {
      ...friendRequest,
      status: EFriendStatus.REJECTED,
    };
  }

  async isPending(userOneId: string, userTwoId: string): Promise<boolean> {
    const exists_1 = await this.friendRequestRepository.findOne({
      where: {
        sender_id: userOneId,
        receiver_id: userTwoId,
        status: EFriendStatus.PENDING,
      },
    });
    const exists_2 = await this.friendRequestRepository.findOne({
      where: {
        sender_id: userTwoId,
        receiver_id: userOneId,
        status: EFriendStatus.PENDING,
      },
    });

    const exists = [exists_1, exists_2].filter(Boolean);
    return exists.length > 0;
  }

  async findById(id: string): Promise<FriendRequest | null> {
    return await this.friendRequestRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
  }
}
