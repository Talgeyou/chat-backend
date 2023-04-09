import { Injectable } from '@nestjs/common';
import { Session, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async verifySession(sessionToken: string): Promise<Session & { user: User }> {
    return this.prismaService.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });
  }
}
