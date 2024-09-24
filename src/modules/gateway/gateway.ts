import { Inject, UseGuards, UseFilters } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { IConversationsService } from '@/modules/conversations/conversations';
import { IFriendsService } from '@/modules/friends/friends';
import { IGroupService } from '@/modules/groups/interfaces/group';
import { Services, WebsocketEvents } from '@/constants/constants';
import { AuthenticatedSocket } from '@/utils/interfaces';
import {
  AddGroupUserResponse,
  CallAcceptedPayload,
  CallHangUpPayload,
  CreateGroupMessageResponse,
  CreateMessageResponse,
  RemoveGroupUserResponse,
  VoiceCallPayload,
} from '@/utils/types';
import { CreateCallDto } from './dtos/CreateCallDto';
import { IGatewaySessionManager } from './gateway.session';
import { Conversation } from '@/modules/conversations/entities/conversation.entity';
import { Message } from '@/modules/messages/entities/message.entity';
import { Group } from '@/modules/groups/entities/Group';
import { GroupMessage } from '@/modules/groups/entities/GroupMessage';
import { AccessTokenGuard } from '@/modules/auth/guards/accessToken-auth.guard';
import { CustomSocketExceptionFilter } from './exceptions/ws-exception.filter';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 15000,
})
@UseFilters(new CustomSocketExceptionFilter())
@UseGuards(AccessTokenGuard)
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(Services.GATEWAY_SESSION_MANAGER)
    readonly sessions: IGatewaySessionManager,
    @Inject(Services.CONVERSATIONS)
    private readonly conversationService: IConversationsService,
    @Inject(Services.GROUPS)
    private readonly groupsService: IGroupService,
    @Inject(Services.FRIENDS_SERVICE)
    private readonly friendsService: IFriendsService,
  ) {}

  @WebSocketServer()
  server: Server;

  // INITS
  handleConnection(socket: AuthenticatedSocket) {
    console.log('Incoming Connection');
    if (!socket.user) return;
    this.sessions.setUserSocket(socket.user._id.toString(), socket);
    socket.emit('connected', {});
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    console.log('handleDisconnect');
    if (!socket.user) return;
    console.log(`${socket.user.name} disconnected.`);
    this.sessions.removeUserSocket(socket.user._id.toString());
  }

  // EVENTS
  @SubscribeMessage('getOnlineGroupUsers')
  async handleGetOnlineGroupUsers(
    @MessageBody() data: any,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const group = await this.groupsService.findGroupById(data.groupId);
    if (!group) return;
    const onlineUsers: any[] = [];
    const offlineUsers: any[] = [];
    group.users.forEach((user: any) => {
      const socket = this.sessions.getUserSocket(user.id);
      socket ? onlineUsers.push(user) : offlineUsers.push(user);
    });
    socket.emit('onlineGroupUsersReceived', { onlineUsers, offlineUsers });
  }

  @SubscribeMessage('createMessage')
  handleCreateMessage(@MessageBody() data: any) {
    console.log('Create Message', data);
  }

  @SubscribeMessage('onConversationJoin')
  onConversationJoin(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log(
      `${client.user?._id.toString()} joined a Conversation of ID: ${data.conversationId}`,
    );
    client.join(`conversation-${data.conversationId}`);
    console.log(client.rooms);
    client.to(`conversation-${data.conversationId}`).emit('userJoin');
  }

  @SubscribeMessage('onConversationLeave')
  onConversationLeave(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onConversationLeave');
    client.leave(`conversation-${data.conversationId}`);
    console.log(client.rooms);
    client.to(`conversation-${data.conversationId}`).emit('userLeave');
  }

  @SubscribeMessage('onGroupJoin')
  onGroupJoin(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onGroupJoin');
    client.join(`group-${data.groupId}`);
    console.log(client.rooms);
    client.to(`group-${data.groupId}`).emit('userGroupJoin');
  }

  @SubscribeMessage('onGroupLeave')
  onGroupLeave(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onGroupLeave');
    client.leave(`group-${data.groupId}`);
    console.log(client.rooms);
    client.to(`group-${data.groupId}`).emit('userGroupLeave');
  }

  @SubscribeMessage('onTypingStart')
  onTypingStart(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onTypingStart');
    console.log(data.conversationId);
    console.log(client.rooms);
    client.to(`conversation-${data.conversationId}`).emit('onTypingStart');
  }

  @SubscribeMessage('onTypingStop')
  onTypingStop(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onTypingStop');
    console.log(data.conversationId);
    console.log(client.rooms);
    client.to(`conversation-${data.conversationId}`).emit('onTypingStop');
  }

  @OnEvent('message.create')
  handleMessageCreateEvent(payload: CreateMessageResponse) {
    console.log('Inside message.create');
    const {
      author,
      conversation: { creator, recipient },
    } = payload.message;

    const authorSocket = this.sessions.getUserSocket(
      author?._id.toString() || '',
    );
    const recipientSocket =
      author?._id.toString() === creator?._id.toString()
        ? this.sessions.getUserSocket(recipient?._id.toString() || '')
        : this.sessions.getUserSocket(creator?._id.toString() || '');

    if (authorSocket) authorSocket.emit('onMessage', payload);
    if (recipientSocket) recipientSocket.emit('onMessage', payload);
  }

  @OnEvent('conversation.create')
  handleConversationCreateEvent(payload: Conversation) {
    console.log('Inside conversation.create');
    const recipientSocket = this.sessions.getUserSocket(payload.recipient_id);
    if (recipientSocket) recipientSocket.emit('onConversation', payload);
  }

  @OnEvent('message.delete')
  async handleMessageDelete(payload: any) {
    console.log('Inside message.delete');
    console.log(payload);
    const conversation = await this.conversationService.findById(
      payload.conversationId,
    );
    if (!conversation) return;
    // const { creator, recipient } = conversation;
    const { creator_id, recipient_id } = conversation;
    const recipientSocket =
      creator_id === payload.userId
        ? this.sessions.getUserSocket(recipient_id)
        : this.sessions.getUserSocket(creator_id);
    if (recipientSocket) recipientSocket.emit('onMessageDelete', payload);
  }

  @OnEvent('message.update')
  async handleMessageUpdate(message: Message) {
    const {
      // author,
      author_id,
      conversation: { creator, recipient },
    } = message;
    console.log(message);
    const recipientSocket =
      author_id === creator?._id.toString()
        ? this.sessions.getUserSocket(recipient?._id.toString() || '')
        : this.sessions.getUserSocket(creator?._id.toString() || '');
    if (recipientSocket) recipientSocket.emit('onMessageUpdate', message);
  }

  @OnEvent('group.message.create')
  async handleGroupMessageCreate(payload: CreateGroupMessageResponse) {
    const id = payload.group._id.toString();
    console.log('Inside group.message.create');
    this.server.to(`group-${id}`).emit('onGroupMessage', payload);
  }

  @OnEvent('group.create')
  handleGroupCreate(payload: Group) {
    console.log('group.create event');
    payload.users.forEach((user) => {
      const socket = this.sessions.getUserSocket(user._id.toString());
      socket && socket.emit('onGroupCreate', payload);
    });
  }

  @OnEvent('group.message.update')
  handleGroupMessageUpdate(payload: GroupMessage) {
    const room = `group-${payload.group._id.toString()}`;
    console.log(room);
    this.server.to(room).emit('onGroupMessageUpdate', payload);
  }

  @OnEvent('group.user.add')
  handleGroupUserAdd(payload: AddGroupUserResponse) {
    const recipientSocket = this.sessions.getUserSocket(
      payload.user._id.toString() || '',
    );
    console.log('inside group.user.add');
    console.log(`group-${payload.group._id.toString()}`);
    this.server
      .to(`group-${payload.group._id.toString()}`)
      .emit('onGroupReceivedNewUser', payload);
    recipientSocket && recipientSocket.emit('onGroupUserAdd', payload);
  }

  @OnEvent('group.user.remove')
  handleGroupUserRemove(payload: RemoveGroupUserResponse) {
    // const { group, user } = payload;
    const ROOM_NAME = `group-${payload.group._id.toString()}`;
    const removedUserSocket = this.sessions.getUserSocket(
      payload.user._id.toString() || '',
    );
    console.log(payload);
    console.log('Inside group.user.remove');
    if (removedUserSocket) {
      console.log('Emitting onGroupRemoved');
      removedUserSocket.emit('onGroupRemoved', payload);
      removedUserSocket.leave(ROOM_NAME);
    }
    this.server.to(ROOM_NAME).emit('onGroupRecipientRemoved', payload);
    // const onlineUsers = group.users
    //   .map((user) => this.sessions.getUserSocket(user._id.toString()) && user)
    //   .filter((user) => user);
    // this.server.to(ROOM_NAME).emit('onlineGroupUsersReceived', { onlineUsers });
  }

  @OnEvent('group.owner.update')
  handleGroupOwnerUpdate(payload: Group) {
    const ROOM_NAME = `group-${payload._id.toString()}`;
    const newOwnerSocket = this.sessions.getUserSocket(
      payload.owner._id.toString() || '',
    );
    console.log('Inside group.owner.update');
    const { rooms } = this.server.sockets.adapter;
    console.log(rooms.get(ROOM_NAME));
    const socketsInRoom = rooms.get(ROOM_NAME);
    console.log('Sockets In Room');
    console.log(socketsInRoom);
    console.log(newOwnerSocket);
    // Check if the new owner is in the group (room)
    this.server.to(ROOM_NAME).emit('onGroupOwnerUpdate', payload);
    if (
      newOwnerSocket &&
      socketsInRoom &&
      !socketsInRoom.has(newOwnerSocket.id)
    ) {
      console.log('The new owner is not in the room...');
      newOwnerSocket.emit('onGroupOwnerUpdate', payload);
    }
  }

  @OnEvent('group.user.leave')
  handleGroupUserLeave(payload: any) {
    console.log('inside group.user.leave');
    const ROOM_NAME = `group-${payload.group.id}`;
    const { rooms } = this.server.sockets.adapter;
    const socketsInRoom = rooms.get(ROOM_NAME);
    const leftUserSocket = this.sessions.getUserSocket(payload.userId);
    /**
     * If socketsInRoom is undefined, this means that there is
     * no one connected to the room. So just emit the event for
     * the connected user if they are online.
     */
    console.log(socketsInRoom);
    console.log(leftUserSocket);
    if (leftUserSocket && socketsInRoom) {
      console.log('user is online, at least 1 person is in the room');
      if (socketsInRoom.has(leftUserSocket.id)) {
        console.log('User is in room... room set has socket id');
        return this.server
          .to(ROOM_NAME)
          .emit('onGroupParticipantLeft', payload);
      } else {
        console.log('User is not in room, but someone is there');
        leftUserSocket.emit('onGroupParticipantLeft', payload);
        this.server.to(ROOM_NAME).emit('onGroupParticipantLeft', payload);
        return;
      }
    }
    if (leftUserSocket && !socketsInRoom) {
      console.log('User is online but there are no sockets in the room');
      return leftUserSocket.emit('onGroupParticipantLeft', payload);
    }
  }

  @SubscribeMessage('getOnlineFriends')
  async handleFriendListRetrieve(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { user } = socket;
    if (user) {
      console.log('user is authenticated');
      console.log(`fetching ${user.name}'s friends`);

      const userId = user._id.toString();
      const friends = await this.friendsService.getFriends(userId);
      const onlineFriends = friends.filter((friend) =>
        this.sessions.getUserSocket(
          userId === friend.receiver_id ? friend.sender_id : friend.receiver_id,
        ),
      );
      socket.emit('getOnlineFriends', onlineFriends);
    }
  }

  @SubscribeMessage('onVideoCallInitiate')
  async handleVideoCall(
    @MessageBody() data: CreateCallDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    console.log('onVideoCallInitiate');
    const caller = socket.user;
    const receiverSocket = this.sessions.getUserSocket(data.recipientId);
    if (!receiverSocket) socket.emit('onUserUnavailable');
    receiverSocket.emit('onVideoCall', { ...data, caller });
  }

  @SubscribeMessage('videoCallAccepted')
  async handleVideoCallAccepted(
    @MessageBody() data: CallAcceptedPayload,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const callerSocket = this.sessions.getUserSocket(
      data.caller._id.toString() || '',
    );
    const conversation = await this.conversationService.isCreated(
      data.caller._id.toString(),
      socket?.user?._id.toString() || '',
    );
    if (!conversation) return console.log('No conversation found');
    if (callerSocket) {
      console.log('Emitting onVideoCallAccept event');
      const payload = { ...data, conversation, acceptor: socket.user };
      callerSocket.emit('onVideoCallAccept', payload);
      socket.emit('onVideoCallAccept', payload);
    }
  }

  @SubscribeMessage(WebsocketEvents.VIDEO_CALL_REJECTED)
  async handleVideoCallRejected(
    @MessageBody() data: any,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    console.log('inside videoCallRejected event');
    const receiver = socket.user;
    const callerSocket = this.sessions.getUserSocket(data.caller.id);
    callerSocket &&
      callerSocket.emit(WebsocketEvents.VIDEO_CALL_REJECTED, { receiver });
    socket.emit(WebsocketEvents.VIDEO_CALL_REJECTED, { receiver });
  }

  @SubscribeMessage('videoCallHangUp')
  async handleVideoCallHangUp(
    @MessageBody() { caller, receiver }: CallHangUpPayload,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    console.log('inside videoCallHangup event');
    if (socket.user?._id.toString() === caller._id.toString()) {
      const receiverSocket = this.sessions.getUserSocket(
        receiver._id.toString() || '',
      );
      socket.emit('onVideoCallHangUp');
      return receiverSocket && receiverSocket.emit('onVideoCallHangUp');
    }
    socket.emit('onVideoCallHangUp');
    const callerSocket = this.sessions.getUserSocket(caller._id.toString());
    callerSocket && callerSocket.emit('onVideoCallHangUp');
  }

  @SubscribeMessage('onVoiceCallInitiate')
  async handleVoiceCallInitiate(
    @MessageBody() payload: VoiceCallPayload,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const caller = socket.user;
    const receiverSocket = this.sessions.getUserSocket(payload.recipientId);
    if (!receiverSocket) socket.emit('onUserUnavailable');
    receiverSocket.emit('onVoiceCall', { ...payload, caller });
  }

  @SubscribeMessage(WebsocketEvents.VOICE_CALL_ACCEPTED)
  async handleVoiceCallAccepted(
    @MessageBody() payload: CallAcceptedPayload,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    console.log('Inside onVoiceCallAccepted event');
    const callerSocket = this.sessions.getUserSocket(
      payload.caller._id.toString() || '',
    );
    const conversation = await this.conversationService.isCreated(
      payload.caller._id.toString(),
      socket.user?._id.toString() || '',
    );
    if (!conversation) return console.log('No conversation found');
    if (callerSocket) {
      console.log('Emitting onVoiceCallAccepted event');
      const callPayload = { ...payload, conversation, acceptor: socket.user };
      callerSocket.emit(WebsocketEvents.VOICE_CALL_ACCEPTED, callPayload);
      socket.emit(WebsocketEvents.VOICE_CALL_ACCEPTED, callPayload);
    }
  }

  @SubscribeMessage(WebsocketEvents.VOICE_CALL_HANG_UP)
  async handleVoiceCallHangUp(
    @MessageBody() { caller, receiver }: CallHangUpPayload,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    console.log('inside onVoiceCallHangUp event');
    if (socket.user?._id.toString() === caller._id.toString()) {
      const receiverSocket = this.sessions.getUserSocket(
        receiver._id.toString(),
      );
      socket.emit(WebsocketEvents.VOICE_CALL_HANG_UP);
      return (
        receiverSocket &&
        receiverSocket.emit(WebsocketEvents.VOICE_CALL_HANG_UP)
      );
    }
    socket.emit(WebsocketEvents.VOICE_CALL_HANG_UP);
    const callerSocket = this.sessions.getUserSocket(caller._id.toString());
    callerSocket && callerSocket.emit(WebsocketEvents.VOICE_CALL_HANG_UP);
  }

  @SubscribeMessage(WebsocketEvents.VOICE_CALL_REJECTED)
  async handleVoiceCallRejected(
    @MessageBody() data: any,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    console.log('inside onVoiceCallRejected event');
    const receiver = socket.user;
    const callerSocket = this.sessions.getUserSocket(data.caller.id);
    callerSocket &&
      callerSocket.emit(WebsocketEvents.VOICE_CALL_REJECTED, { receiver });
    socket.emit(WebsocketEvents.VOICE_CALL_REJECTED, { receiver });
  }
}
