import { UseGuards } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { config } from 'dotenv';
import { Socket, Server } from 'socket.io';
import { NextAuthStrategy } from 'src/auth/next-auth-strategy.strategy';
import { MessageCreateDTO, MessageWithUser } from 'src/messages/types';
import { MessagesService } from 'src/messages/messages.service';
import { UsersService } from 'src/users/users.service';
import { User } from '@prisma/client';

config();

const users: Record<string, User> = {};

@UseGuards(NextAuthStrategy)
@WebSocketGateway({
  cors: process.env.FRONTEND_URL,
  serveClient: false,
  namespace: 'chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
  ) {}

  afterInit(server: Server) {
    console.log('[LOG] Websocket server has been initialized', { server });
  }

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    const socketId = client.id;

    if (typeof userId === 'string') {
      const user = await this.usersService.getOneById(userId);

      users[socketId] = user;

      client.broadcast.emit('users:connect', user);

      client.emit('users:get', Object.values(users));
      client.emit('messages:get', await this.messagesService.getMessages());

      client.broadcast.emit('log', `${user.name} connected`);
    }
  }

  handleDisconnect(client: Socket) {
    const socketId = client.id;
    const user = users[socketId];

    client.broadcast.emit('users:disconnect', user);
    client.broadcast.emit('log', `${user.name} disconnected`);

    delete users[socketId];
  }

  @SubscribeMessage('messages:post')
  async handlePostMessage(
    @MessageBody() [message, id]: [MessageCreateDTO, string],
  ): Promise<MessageWithUser> {
    try {
      const createdMessage = await this.messagesService.createMessage(message);
      this.server.emit('messages:post', createdMessage, id);
      return createdMessage;
    } catch (e) {
      console.log(e);
      this.server.emit('messages:post-error', id);
      return null;
    }
  }
}
