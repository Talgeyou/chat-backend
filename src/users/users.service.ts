import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  getAll() {
    return this.prismaService.user.findMany();
  }

  getOneById(id: string) {
    return this.prismaService.user.findUnique({ where: { id } });
  }
}
