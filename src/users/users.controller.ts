import { Controller, Get, UseGuards } from '@nestjs/common';
import { NextAuthStrategy } from 'src/auth/next-auth-strategy.strategy';
import { UsersService } from './users.service';

@UseGuards(NextAuthStrategy)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('')
  getAll() {
    return this.usersService.getAll();
  }
}
