'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

// ============================================================================
// ERROR LOGGING SERVICE
// ============================================================================

// Circular-safe JSON stringify replacer
function getCircularReplacer() {
  const seen = new WeakSet();
  return (_key: string, value: unknown) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }
    return value;
  };
}

class ErrorLogger {
  static log(error: Error, errorInfo: ErrorInfo, context?: Record<string, unknown>) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Prepare error data
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      context,
    };

    // Send to error tracking service (e.g., Sentry, LogRocket)
    this.sendToErrorService(errorData);

    // Store in local storage for debugging
    this.storeLocally(errorData);
  }

  private static sendToErrorService(errorData: Record<string, unknown>) {
    // TODO: Integrate with error tracking service
    // Example: Sentry.captureException(error, { extra: errorData })

    // For now, log to API endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/errors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData, getCircularReplacer()),
      }).catch((err) => {
        console.error('Failed to send error to service:', err);
      });
    }
  }

  private static storeLocally(errorData: Record<string, unknown>) {
    if (typeof window === 'undefined') return;

    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(errorData);

      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.shift();
      }

      localStorage.setItem('app_errors', JSON.stringify(errors, getCircularReplacer()));
    } catch (err) {
      console.error('Failed to store error locally:', err);
    }
  }

  static getStoredErrors(): unknown[] {
    if (typeof window === 'undefined') return [];

    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch {
      return [];
    }
  }

  static clearStoredErrors() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('app_errors');
  }
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: props.showDetails ?? false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error
    ErrorLogger.log(error, errorInfo, {
      props: this.props,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when props change (if enabled)
    if (this.props.resetOnPropsChange && prevProps.children !== this.props.children) {
      this.handleReset();
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: this.props.showDetails ?? false,
      copied: false,
    });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/dashboard';
    }
  };

  handleCopyError = () => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    const errorText = `
Error: ${error.message}

Stack Trace:
${error.stack}

Component Stack:
${errorInfo?.componentStack}

Timestamp: ${new Date().toISOString()}
URL: ${typeof window !== 'undefined' ? window.location.href : 'unknown'}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      this.setState({ copied: true });
      toast.success('Erreur copiée', {
        description: 'Les détails de l\'erreur ont été copiés dans le presse-papiers.',
      });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    const { hasError, error, errorInfo, showDetails, copied } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    // Use custom fallback if provided
    if (fallback) {
      return fallback;
    }

    // Default error UI
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <Card className="max-w-3xl w-full p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                Une erreur est survenue
              </h1>
              <p className="text-muted-foreground mt-1">
                L'application a rencontré une erreur inattendue. Nos équipes ont été notifiées.
              </p>
            </div>
          </div>

          {/* Error Alert */}
          <Alert variant="destructive">
            <Bug className="h-4 w-4" />
            <AlertTitle>Message d'erreur</AlertTitle>
            <AlertDescription className="mt-2 font-mono text-sm">
              {error?.message || 'Erreur inconnue'}
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={this.handleReset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
            <Button onClick={this.handleReload} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Recharger la page
            </Button>
            <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Retour au tableau de bord
            </Button>
            <Button
              onClick={this.handleCopyError}
              variant="outline"
              className="gap-2 ml-auto"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copier l'erreur
                </>
              )}
            </Button>
          </div>

          {/* Details Toggle */}
          <div className="border-t pt-6">
            <button
              onClick={this.toggleDetails}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              {showDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {showDetails ? 'Masquer' : 'Afficher'} les détails techniques
            </button>

            {showDetails && (
              <div className="mt-4 space-y-4">
                {/* Stack Trace */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Stack Trace</h3>
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all">
                      {error?.stack || 'No stack trace available'}
                    </pre>
                  </div>
                </div>

                {/* Component Stack */}
                {errorInfo?.componentStack && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Component Stack</h3>
                    <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Debug Info */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Debug Information</h3>
                  <div className="bg-muted p-4 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timestamp:</span>
                      <span className="font-mono">{new Date().toISOString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">URL:</span>
                      <span className="font-mono truncate max-w-md">
                        {typeof window !== 'undefined' ? window.location.href : 'unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User Agent:</span>
                      <span className="font-mono text-xs truncate max-w-md">
                        {typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <p className="font-medium mb-2">💡 Que faire maintenant ?</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Essayez de recharger la page ou de revenir au tableau de bord</li>
              <li>Si le problème persiste, contactez le support technique</li>
              <li>Vous pouvez copier les détails de l'erreur pour les partager avec l'équipe</li>
            </ul>
          </div>
        </Card>
      </div>
    );
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ErrorBoundary;
export { ErrorLogger };
