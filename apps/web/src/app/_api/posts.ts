// Forward to your existing API client (no backend change)
import { api } from "@/lib/api/client";

// match panel imports: `import * as posts from "@/lib/api/posts"`
export const listMine = () => api.posts.listMine();

export const create = (body: {
  caption?: string;
  isPaid: boolean;
  price?: number;
  mediaIds?: string[];
}) => api.posts.create(body);
