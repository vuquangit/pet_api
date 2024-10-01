import {
  AcceptFriendRequestResponse,
  CancelFriendRequestParams,
  CreateFriendParams,
  FriendRequestParams,
} from '@/modules/friend-requests/interfaces/friendRequest.interface';
import { FriendRequest } from '@/modules/friend-requests/entities/friendRequest.entity';

export interface IFriendRequestService {
  getFriendRequests(userId: string): Promise<FriendRequest[]>;
  create(params: CreateFriendParams): any;
  accept(params: FriendRequestParams): Promise<AcceptFriendRequestResponse>;
  cancel(params: CancelFriendRequestParams): Promise<FriendRequest>;
  reject(params: CancelFriendRequestParams): Promise<FriendRequest>;
  isPending(userOneId: string, userTwoId: string): any;
  findById(id: string): Promise<FriendRequest | null>;
}
