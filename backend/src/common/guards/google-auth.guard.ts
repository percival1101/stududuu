import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  handleRequest(err: any, user: any, info: any, _context: ExecutionContext) {
    if (err || !user) {
      console.error(
        '[GoogleAuthGuard] Passport Google Authentication Error:',
        err || info,
      );
      return null;
    }
    return user;
  }
}
