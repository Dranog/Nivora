import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PlaybackService } from '../playback.service';

@Injectable()
export class SignedUrlGuard implements CanActivate {
  constructor(private playbackService: PlaybackService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.params.token;

    if (!token) {
      throw new UnauthorizedException('No playback token provided');
    }

    const ua = request.headers['user-agent'] || '';
    const ip = request.ip || request.connection.remoteAddress;

    const payload = await this.playbackService.validatePlaybackToken(token, ua, ip);

    // Attach payload to request
    request.playbackPayload = payload;

    return true;
  }
}
