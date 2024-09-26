import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IImageStorageService } from '../../image-storage/image-storage';
import { UserNotFoundException } from '../../users/exceptions/UserNotFound';
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
import { User } from '@/modules/users/entities/user.entity';
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
    const users: User[] = (await Promise.all(usersPromise)).filter(
      (user) => user,
    ) as User[];
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
    const groupSaved = await this.groupRepository.save(group);

    return {
      ...groupSaved,
      users,
      creator,
      owner: creator,
    };
  }

  async getGroups(params: FetchGroupsParams): Promise<Group[]> {
    // return this.groupRepository
    //   .createQueryBuilder('group')
    //   .leftJoinAndSelect('group.users', 'user')
    //   .where('user.id IN (:users)', { users: [params.userId] })
    //   .leftJoinAndSelect('group.users', 'users')
    //   .leftJoinAndSelect('group.creator', 'creator')
    //   .leftJoinAndSelect('group.owner', 'owner')
    //   .leftJoinAndSelect('group.lastMessageSent', 'lastMessageSent')
    //   .leftJoinAndSelect('users.profile', 'usersProfile')
    //   .leftJoinAndSelect('users.presence', 'usersPresence')
    //   .orderBy('group.lastMessageSentAt', 'DESC')
    //   .getMany();

    // FIXME: get relation
    const groupFounds = await this.groupRepository.find({
      where: { user_ids: params.userId },
    });

    let groups: Group[] = [];
    if (groupFounds.length > 0) {
      groups = await Promise.all(
        groupFounds.map(async (group) => await this.getGroupRelations(group)),
      );
    }

    return groups;
  }

  async findGroupById(id: string): Promise<Group> {
    if (!id) throw new GroupNotFoundException();

    const groupFound = await this.groupRepository.findOne({
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

    return await this.getGroupRelations(groupFound);
  }

  async getGroupRelations(_group: Group | null): Promise<Group> {
    if (!_group) throw new GroupNotFoundException();

    // relation: creator
    const creatorFound = await this.userService.findById(_group.creator_id);
    creatorFound && (_group.creator = creatorFound);

    // relation: users
    if (_group.user_ids) {
      const users = await Promise.all(
        _group.user_ids.map(
          async (userId) => await this.userService.findById(userId),
        ),
      );

      users && (_group.users = users as User[]);
    }

    // relation: lastMessageSent
    if (_group.lastMessageSent_id) {
      const groupMessageFound = await this.groupMessageRepository.findOne({
        where: {
          _id: new ObjectId(_group.lastMessageSent_id),
        },
      });
      groupMessageFound && (_group.lastMessageSent = groupMessageFound);
    }

    // relation: owner
    const ownerFound = await this.userService.findById(_group.owner_id);
    ownerFound && (_group.owner = ownerFound);

    return _group;
  }

  saveGroup(group: Group): Promise<Group> {
    return this.groupRepository.save(group);
  }

  async hasAccess({ id, userId }: AccessParams): Promise<User | undefined> {
    const group = await this.findGroupById(id);
    if (!group) throw new GroupNotFoundException();
    return group?.users?.find((user) => user._id.toString() === userId);
  }

  async transferGroupOwner({
    userId,
    groupId,
    new_owner_id,
  }: TransferOwnerParams): Promise<Group> {
    const group = await this.findGroupById(groupId);
    if (!group) throw new GroupNotFoundException();
    if (group.owner_id !== userId)
      throw new GroupOwnerTransferException('Insufficient Permissions');
    if (group.owner_id === new_owner_id)
      throw new GroupOwnerTransferException(
        'Cannot Transfer Owner to yourself',
      );

    const newOwner = await this.userService.findById(new_owner_id);
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
