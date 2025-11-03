export interface JwtPayload {
  sub: string;       // ID utilisateur
  email: string;     // adresse e-mail
  role?: string;     // optionnel
}
