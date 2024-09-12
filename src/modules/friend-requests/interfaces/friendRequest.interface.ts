import { User } from '@/modules/users/entity/user.entity';
import { Friend } from '@/modules/friends/entity/friend.entity';
import { FriendRequest } from '@/modules/friend-requests/entity/friendRequest.entity';

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
