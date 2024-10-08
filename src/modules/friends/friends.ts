import { Friend } from './entities/friend.entity';
import { DeleteFriendRequestParams } from './interfaces/friend.interface';

export interface IFriendsService {
  getFriends(id: string): Promise<Friend[]>;
  findFriendById(id: string): Promise<Friend>;
  deleteFriend(params: any): DeleteFriendRequestParams;
  isFriends(userOneId: string, userTwoId: string): Promise<Friend | undefined>;
  searchFriends(userId: string, query: string): Promise<Friend[]>;
}
