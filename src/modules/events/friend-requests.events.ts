import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
// import { MessagingGateway } from '../gateway/gateway';
import { ServerEvents, WebsocketEvents } from '@/constants/constants';
import { FriendRequest } from '../friend-requests/entity/friendRequest.entity';
import { AcceptFriendRequestResponse } from '@/modules/friend-requests/interfaces/friendRequest.interface';

@Injectable()
export class FriendRequestsEvents {
  // constructor(private readonly gateway: MessagingGateway) {}

  @OnEvent(ServerEvents.FRIEND_REQUEST_CREATED)
  friendRequestCreate(payload: FriendRequest) {
    console.log(ServerEvents.FRIEND_REQUEST_CREATED);
    // const receiverSocket = this.gateway.sessions.getUserSocket(
    //   payload.receiver_id,
    // );
    // receiverSocket && receiverSocket.emit('onFriendRequestReceived', payload);
  }

  @OnEvent(ServerEvents.FRIEND_REQUEST_CANCELLED)
  handleFriendRequestCancel(payload: FriendRequest) {
    console.log(ServerEvents.FRIEND_REQUEST_CANCELLED);
    // const receiverSocket = this.gateway.sessions.getUserSocket(
    //   payload.receiver_id,
    // );
    // receiverSocket && receiverSocket.emit('onFriendRequestCancelled', payload);
  }

  @OnEvent(ServerEvents.FRIEND_REQUEST_ACCEPTED)
  handleFriendRequestAccepted(payload: AcceptFriendRequestResponse) {
    console.log(ServerEvents.FRIEND_REQUEST_ACCEPTED);
    // const senderSocket = this.gateway.sessions.getUserSocket(
    //   payload.friendRequest.sender_id,
    // );
    // senderSocket &&
    //   senderSocket.emit(WebsocketEvents.FRIEND_REQUEST_ACCEPTED, payload);
  }

  @OnEvent(ServerEvents.FRIEND_REQUEST_REJECTED)
  handleFriendRequestRejected(payload: FriendRequest) {
    console.log(ServerEvents.FRIEND_REQUEST_REJECTED);
    // const senderSocket = this.gateway.sessions.getUserSocket(payload.sender_id);
    // senderSocket &&
    //   senderSocket.emit(WebsocketEvents.FRIEND_REQUEST_REJECTED, payload);
  }
}
