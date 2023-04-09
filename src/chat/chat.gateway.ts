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

config();

const users: Record<string, string> = {};

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

  constructor(private messagesService: MessagesService) {}

  afterInit(server: Server) {
    console.log('[LOG] Websocket server has been initialized', { server });
  }

  handleConnection(client: Socket) {
    const userName = client.handshake.query.userName as string;
    const socketId = client.id;
    users[socketId] = userName;

    // передаем информацию всем клиентам, кроме текущего
    client.broadcast.emit('log', `${userName} connected`);
  }

  handleDisconnect(client: Socket) {
    const socketId = client.id;
    const userName = users[socketId];
    delete users[socketId];

    client.broadcast.emit('log', `${userName} disconnected`);
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
      this.server.emit('messages:post-error');
      return null;
    }
  }
}
