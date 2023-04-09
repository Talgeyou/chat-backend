import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { NextAuthStrategy } from './next-auth-strategy.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.TOKEN_SECRET,
      signOptions: {
        expiresIn: '1h',
        algorithm: 'HS512',
      },
    }),
    PrismaModule,
  ],
  providers: [NextAuthStrategy, AuthService],
  exports: [NextAuthStrategy, PassportModule, AuthService],
})
export class AuthModule {}
