export type UserRole = 'creator' | 'fan' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  verified: boolean
}

// Stub schema for user list validation
export const userListSchema = {
  parse: (data: any) => data,
  safeParse: (data: any) => ({ success: true, data }),
}

// User list response type (stub)
export interface UserList {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}
