import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';

const cookieName = // This turnary statement is the conditional logic I mentioned previously
  process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

@Injectable()
export class NextAuthStrategy extends PassportStrategy(
  Strategy,
  'nextauth-session',
) {
  constructor(private authService: AuthService) {
    super();
  }
  // The Request type is imported from Express
  async validate(req: Request): Promise<User | null> {
    const sessionToken = req.cookies[cookieName];
    if (!sessionToken) {
      throw new UnauthorizedException({ message: 'No session token' });
    }

    const session = await this.authService.verifySession(sessionToken);
    if (!session) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid Session',
      });
    }
    // Whatever you return gets added to the request object as `req.user`
    return session.user;
  }
}
