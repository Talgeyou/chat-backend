import { Message, User } from '@prisma/client';

export type MessageCreateDTO = {
  userId: string;
  body: string;
  id: string;
};

export type MessageWithUser = Message & {
  user: User;
};
