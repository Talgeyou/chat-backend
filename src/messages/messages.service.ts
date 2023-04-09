import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageCreateDTO, MessageWithUser } from './types';

@Injectable()
export class MessagesService {
  constructor(private prismaService: PrismaService) {}

  async createMessage(message: MessageCreateDTO): Promise<MessageWithUser> {
    const createdMessage = await this.prismaService.message.create({
      data: {
        body: message.body,
        user: {
          connect: {
            id: message.userId,
          },
        },
      },
      include: {
        user: true,
      },
    });

    return createdMessage;
  }
}
