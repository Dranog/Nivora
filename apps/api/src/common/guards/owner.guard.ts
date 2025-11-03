import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class OwnerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;

    if (!user || !resourceId) {
      throw new ForbiddenException('Access denied');
    }

    // Get the resource type from the route path
    const path = request.route.path;

    if (path.includes('/posts')) {
      const post = await prisma.post.findUnique({
        where: { id: resourceId },
      });

      if (!post) {
        throw new ForbiddenException('Resource not found');
      }

      if (post.creatorId !== user.id) {
        throw new ForbiddenException('You do not own this resource');
      }

      return true;
    }

    // Add other resource types as needed
    throw new ForbiddenException('Unknown resource type');
  }
}
