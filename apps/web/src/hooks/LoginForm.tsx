"use client";

/**
 * Pas de doublon : on réutilise TON composant existant.
 * Ce fichier n'est qu'un alias fin vers AuthForm pour garder le nom "LoginForm".
 */

import { AuthForm } from "@/components/auth/AuthForm";

export function LoginForm() {
  return <AuthForm />;
}

export default LoginForm;
