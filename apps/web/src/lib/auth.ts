import { z } from 'zod';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Schemas
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

const authResponseSchema = z.object({
  access_token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    role: z.string(),
    displayName: z.string().optional(),
  }),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type User = AuthResponse['user'];

// Token management
const TOKEN_KEY = 'accessToken';
const USER_KEY = 'admin_user';

export const auth = {
  /**
   * Login admin user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Validate input
    const validated = loginSchema.parse(credentials);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important pour les cookies httpOnly
        body: JSON.stringify(validated),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur de connexion' }));
        throw new Error(error.message || 'Identifiants invalides');
      }

      const data = await response.json();
      const authData = authResponseSchema.parse(data);

      // Store token in localStorage as backup (cookie httpOnly is primary)
      localStorage.setItem(TOKEN_KEY, authData.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(authData.user));

      return authData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('Réponse API invalide');
      }
      throw error;
    }
  },

  /**
   * Logout admin user
   */
  logout(): void {
    // Clear localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Clear cookie via API call (optional, server can handle expiration)
    fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {
      // Ignore errors, we're logging out anyway
    });
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get stored user
   */
  getUser(): User | null {
    if (typeof window === 'undefined') return null;

    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  },

  /**
   * Verify token validity with backend
   */
  async verifyToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE}/auth/verify`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        this.logout();
        return false;
      }

      return true;
    } catch {
      this.logout();
      return false;
    }
  },
};
