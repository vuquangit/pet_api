import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IImageStorageService } from '../../image-storage/image-storage';
import { UserNotFoundException } from '../../users/exceptions/UserNotFound';
// import { IUserService } from '../../users/interfaces/user';
import { Services } from '@/constants/constants';
// import { generateUUIDV4 } from '@/utils/helpers';
import {
  AccessParams,
  // Attachment,
  CreateGroupParams,
  FetchGroupsParams,
  TransferOwnerParams,
  UpdateGroupDetailsParams,
} from '@/utils/types';
import { GroupNotFoundException } from '../exceptions/GroupNotFound';
import { GroupOwnerTransferException } from '../exceptions/GroupOwnerTransfer';
import { IGroupService } from '../interfaces/group';
import { Group } from '../entities/Group';
import { UsersService } from '@/modules/users/users.service';
import { User } from '@/modules/users/entity/user.entity';
import { ObjectId } from 'mongodb';
import { GroupMessage } from '../entities/GroupMessage';

@Injectable()
export class GroupService implements IGroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupMessage)
    private readonly groupMessageRepository: Repository<GroupMessage>,
    private readonly userService: UsersService,
    @Inject(Services.IMAGE_UPLOAD_SERVICE)
    private readonly imageStorageService: IImageStorageService,
  ) {}

  async createGroup(params: CreateGroupParams) {
    const { creator, title } = params;
    const usersPromise = params.users.map((userId) =>
      this.userService.findById(userId),
    );
    const users = (await Promise.all(usersPromise)).filter((user) => user);
    users.push(creator);

    const userIds: string[] = users.map((user: User) => user._id.toString());
    if (!userIds.length) throw new UserNotFoundException();

    // const groupParams = { owner: creator, users, creator, title };
    const group = this.groupRepository.create({
      owner_id: creator._id.toString(),
      user_ids: userIds,
      creator_id: creator._id.toString(),
      title,
    });
    return this.groupRepository.save(group);
  }

  getGroups(params: FetchGroupsParams): Promise<Group[]> {
    return this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.users', 'user')
      .where('user.id IN (:users)', { users: [params.userId] })
      .leftJoinAndSelect('group.users', 'users')
      .leftJoinAndSelect('group.creator', 'creator')
      .leftJoinAndSelect('group.owner', 'owner')
      .leftJoinAndSelect('group.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('users.profile', 'usersProfile')
      .leftJoinAndSelect('users.presence', 'usersPresence')
      .orderBy('group.lastMessageSentAt', 'DESC')
      .getMany();
  }

  async findGroupById(id: string): Promise<Group> {
    const groupFounds = await this.groupRepository.findOne({
      where: { _id: new ObjectId(id) },
      // relations: [
      //   'creator',
      //   'users',
      //   'lastMessageSent',
      //   'owner',
      //   'users.profile',
      //   'users.presence',
      // ],
    });

    if (!groupFounds) throw new GroupNotFoundException();

    const creatorFound = await this.userService.findById(
      groupFounds.creator_id,
    );
    creatorFound && (groupFounds.creator = creatorFound);

    // TODO: get relation users
    // const userReceiverFound = await this.userService.findById(
    //   groupFounds.user_ids,
    // );
    // groupFounds.users = userReceiverFound;

    if (groupFounds.lastMessageSent_id) {
      const groupMessageFound = await this.groupMessageRepository.findOne({
        where: {
          _id: new ObjectId(groupFounds.lastMessageSent_id),
        },
      });
      groupMessageFound && (groupFounds.lastMessageSent = groupMessageFound);
    }

    const ownerFound = await this.userService.findById(groupFounds.owner_id);
    ownerFound && (groupFounds.owner = ownerFound);

    return groupFounds;
  }

  saveGroup(group: Group): Promise<Group> {
    return this.groupRepository.save(group);
  }

  async hasAccess({ id, userId }: AccessParams): Promise<User | undefined> {
    const group = await this.findGroupById(id);
    if (!group) throw new GroupNotFoundException();
    return group.users.find((user) => user._id.toString() === userId);
  }

  async transferGroupOwner({
    userId,
    groupId,
    newOwnerId,
  }: TransferOwnerParams): Promise<Group> {
    const group = await this.findGroupById(groupId);
    if (!group) throw new GroupNotFoundException();
    if (group.owner_id !== userId)
      throw new GroupOwnerTransferException('Insufficient Permissions');
    if (group.owner_id === newOwnerId)
      throw new GroupOwnerTransferException(
        'Cannot Transfer Owner to yourself',
      );

    const newOwner = await this.userService.findById(newOwnerId);
    if (!newOwner) throw new UserNotFoundException();
    group.owner = newOwner;
    return this.groupRepository.save(group);
  }

  async updateDetails(params: UpdateGroupDetailsParams): Promise<Group> {
    const group = await this.findGroupById(params.id);
    if (!group) throw new GroupNotFoundException();
    // if (params.avatar) {
    // const key = generateUUIDV4();
    // await this.imageStorageService.upload({ key, file: params.avatar });
    // group.avatar = key;
    // }
    group.title = params.title ?? group.title;
    return this.groupRepository.save(group);
  }
}
