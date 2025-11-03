'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  FileWarning,
  ServerCrash,
  WifiOff,
  ShieldAlert,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type ErrorType = 'generic' | 'network' | 'server' | 'permission' | 'notfound';

interface ErrorFallbackProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onReset?: () => void;
  onGoHome?: () => void;
  showStack?: boolean;
  error?: Error;
}

// ============================================================================
// ERROR TYPE CONFIGS
// ============================================================================

const ERROR_CONFIGS: Record<
  ErrorType,
  {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    message: string;
    color: string;
  }
> = {
  generic: {
    icon: AlertTriangle,
    title: 'Une erreur est survenue',
    message: 'L\'application a rencontré une erreur inattendue.',
    color: 'text-destructive',
  },
  network: {
    icon: WifiOff,
    title: 'Problème de connexion',
    message:
      'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
    color: 'text-orange-600',
  },
  server: {
    icon: ServerCrash,
    title: 'Erreur serveur',
    message: 'Le serveur a rencontré une erreur. Nos équipes ont été notifiées.',
    color: 'text-red-600',
  },
  permission: {
    icon: ShieldAlert,
    title: 'Accès refusé',
    message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.',
    color: 'text-amber-600',
  },
  notfound: {
    icon: FileWarning,
    title: 'Page introuvable',
    message: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
    color: 'text-blue-600',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ErrorFallback({
  type = 'generic',
  title,
  message,
  onReset,
  onGoHome,
  showStack = false,
  error,
}: ErrorFallbackProps) {
  const config = ERROR_CONFIGS[type];
  const Icon = config.icon;

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/admin/dashboard';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        {/* Icon and Title */}
        <div className="flex items-start gap-4">
          <div className={`p-3 bg-muted rounded-lg ${config.color}`}>
            <Icon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{title || config.title}</h2>
            <p className="text-muted-foreground mt-1">
              {message || config.message}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Détails de l'erreur</AlertTitle>
            <AlertDescription className="mt-2 font-mono text-sm">
              {error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Stack Trace (Development Only) */}
        {showStack && error?.stack && process.env.NODE_ENV === 'development' && (
          <div className="bg-muted p-4 rounded-lg overflow-x-auto">
            <p className="text-xs font-semibold mb-2">Stack Trace (Dev Only):</p>
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
              {error.stack}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {onReset !== null && (
            <Button onClick={handleReset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
          )}
          <Button onClick={handleGoHome} variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            Retour au tableau de bord
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
          <p className="font-medium mb-2">💡 Que faire maintenant ?</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            {type === 'network' && (
              <>
                <li>Vérifiez votre connexion internet</li>
                <li>Attendez quelques instants et réessayez</li>
              </>
            )}
            {type === 'server' && (
              <>
                <li>Attendez quelques minutes, nos équipes travaillent sur le problème</li>
                <li>Essayez de rafraîchir la page</li>
              </>
            )}
            {type === 'permission' && (
              <>
                <li>Vérifiez que vous êtes connecté avec le bon compte</li>
                <li>Contactez un administrateur si nécessaire</li>
              </>
            )}
            {type === 'notfound' && (
              <>
                <li>Vérifiez l'URL dans la barre d'adresse</li>
                <li>Retournez au tableau de bord pour naviguer</li>
              </>
            )}
            {type === 'generic' && (
              <>
                <li>Essayez de recharger la page</li>
                <li>Si le problème persiste, contactez le support</li>
              </>
            )}
          </ul>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// PRESET ERROR COMPONENTS
// ============================================================================

export function NetworkError(props: Omit<ErrorFallbackProps, 'type'>) {
  return <ErrorFallback {...props} type="network" />;
}

export function ServerError(props: Omit<ErrorFallbackProps, 'type'>) {
  return <ErrorFallback {...props} type="server" />;
}

export function PermissionError(props: Omit<ErrorFallbackProps, 'type'>) {
  return <ErrorFallback {...props} type="permission" />;
}

export function NotFoundError(props: Omit<ErrorFallbackProps, 'type'>) {
  return <ErrorFallback {...props} type="notfound" />;
}
