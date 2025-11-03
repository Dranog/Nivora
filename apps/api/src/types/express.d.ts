declare namespace Express {
  export interface Request {
    correlationId?: string;
    user?: {
      id: string;
      email: string;
      role: string;
      [key: string]: any;
    };
    playbackPayload?: {
      mediaId: string;
      [key: string]: any;
    };
  }
}
