import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to allow unauthenticated requests
  handleRequest(err: any, user: any) {
    // If there's no user and no error, just return null (allow request to continue)
    if (!user && !err) {
      return null;
    }

    // If there's an error, just return null (allow request to continue without user)
    if (err) {
      return null;
    }

    return user;
  }

  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    return super.canActivate(context) as Promise<boolean>;
  }
}
