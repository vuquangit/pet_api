import { User } from '@/modules/users/entities/user.entity';
import { Friend } from '@/modules/friends/entities/friend.entity';
import { FriendRequest } from '@/modules/friend-requests/entities/friendRequest.entity';

export type FriendRequestParams = {
  id: string;
  userId: string;
};

export type CancelFriendRequestParams = {
  id: string;
  userId: string;
};

export type CreateFriendParams = {
  user: User;
  request_id: string;
};

export type AcceptFriendRequestResponse = {
  friend: Friend;
  friendRequest: FriendRequest;
};
