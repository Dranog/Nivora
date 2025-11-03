import { api } from "@/lib/api/client";

// match panel imports: `import * as media from "@/lib/api/media"`
export const getSignedUrl = (body: {
  contentType: string;
  contentLength: number;
  purpose: "PAID" | "TEASER";
}) => api.storage.getSignedUrl(body);

export const complete = (body: { objectKey: string; checksum: string }) =>
  api.storage.complete(body);

export const playback = (body: { mediaId: string }) =>
  api.storage.playback(body);
