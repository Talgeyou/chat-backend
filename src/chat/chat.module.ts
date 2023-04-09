import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { MessagesModule } from 'src/messages/messages.module';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [AuthModule, MessagesModule, UsersModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
