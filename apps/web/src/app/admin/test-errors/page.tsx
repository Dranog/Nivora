'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Bug,
  WifiOff,
  ServerCrash,
  ShieldAlert,
  FileWarning,
} from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import {
  ErrorFallback,
  NetworkError,
  ServerError,
  PermissionError,
  NotFoundError,
} from '@/components/errors/ErrorFallback';

/**
 * Test page for Error Boundary validation
 * This page should be removed in production or protected behind feature flag
 */

// Component that throws an error
function ThrowError({ type = 'generic' }: { type?: string }) {
  if (type === 'render') {
    throw new Error('Test render error: This is a simulated React render error');
  }

  if (type === 'async') {
    // Simulate async error
    setTimeout(() => {
      throw new Error('Test async error: This is a simulated async error');
    }, 100);
  }

  if (type === 'undefined') {
    // Access undefined property
    const obj: any = undefined;
    return <div>{obj.property}</div>;
  }

  if (type === 'null') {
    // Null reference error
    const arr: any = null;
    return <div>{arr.map(() => {})}</div>;
  }

  return <div>Error component loaded (no error thrown yet)</div>;
}

export default function TestErrorsPage() {
  const [showErrorComponent, setShowErrorComponent] = useState(false);
  const [errorType, setErrorType] = useState<string>('generic');
  const [fallbackType, setFallbackType] = useState<
    'generic' | 'network' | 'server' | 'permission' | 'notfound'
  >('generic');

  const handleThrowError = (type: string) => {
    setErrorType(type);
    setShowErrorComponent(true);
  };

  const handleReset = () => {
    setShowErrorComponent(false);
    setErrorType('generic');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Bug className="w-6 h-6 text-destructive" />
          <h1 className="text-3xl font-bold">Error Boundary Test Page</h1>
          <Badge variant="destructive">Dev Only</Badge>
        </div>
        <p className="text-muted-foreground">
          Test page to validate error boundary functionality and error fallback components.
        </p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>⚠️ Development Only</AlertTitle>
        <AlertDescription>
          This page is for testing purposes only. Remove or protect before production deployment.
        </AlertDescription>
      </Alert>

      {/* Error Boundary Tests */}
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Error Boundary Tests</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Click buttons to trigger different types of React errors and see how the error
            boundary handles them.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={() => handleThrowError('render')}
            variant="destructive"
            className="w-full"
          >
            <Bug className="w-4 h-4 mr-2" />
            Render Error
          </Button>

          <Button
            onClick={() => handleThrowError('undefined')}
            variant="destructive"
            className="w-full"
          >
            <Bug className="w-4 h-4 mr-2" />
            Undefined Error
          </Button>

          <Button
            onClick={() => handleThrowError('null')}
            variant="destructive"
            className="w-full"
          >
            <Bug className="w-4 h-4 mr-2" />
            Null Error
          </Button>

          <Button
            onClick={() => handleThrowError('async')}
            variant="destructive"
            className="w-full"
          >
            <Bug className="w-4 h-4 mr-2" />
            Async Error
          </Button>
        </div>

        {showErrorComponent && (
          <div className="border-2 border-destructive rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium">Error Component (will throw error):</p>
              <Button onClick={handleReset} size="sm" variant="outline">
                Reset
              </Button>
            </div>

            <ErrorBoundary onError={(error, info) => console.log('Error caught:', error, info)}>
              <ThrowError type={errorType} />
            </ErrorBoundary>
          </div>
        )}
      </Card>

      {/* Error Fallback Component Tests */}
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Error Fallback Components</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Preview different error fallback UI variants for specific error types.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            onClick={() => setFallbackType('generic')}
            variant={fallbackType === 'generic' ? 'default' : 'outline'}
            size="sm"
          >
            Generic
          </Button>
          <Button
            onClick={() => setFallbackType('network')}
            variant={fallbackType === 'network' ? 'default' : 'outline'}
            size="sm"
          >
            <WifiOff className="w-4 h-4 mr-2" />
            Network
          </Button>
          <Button
            onClick={() => setFallbackType('server')}
            variant={fallbackType === 'server' ? 'default' : 'outline'}
            size="sm"
          >
            <ServerCrash className="w-4 h-4 mr-2" />
            Server
          </Button>
          <Button
            onClick={() => setFallbackType('permission')}
            variant={fallbackType === 'permission' ? 'default' : 'outline'}
            size="sm"
          >
            <ShieldAlert className="w-4 h-4 mr-2" />
            Permission
          </Button>
          <Button
            onClick={() => setFallbackType('notfound')}
            variant={fallbackType === 'notfound' ? 'default' : 'outline'}
            size="sm"
          >
            <FileWarning className="w-4 h-4 mr-2" />
            Not Found
          </Button>
        </div>

        <div className="border rounded-lg p-4 bg-muted/30">
          {fallbackType === 'generic' && (
            <ErrorFallback
              error={new Error('This is a test generic error message')}
              onReset={() => alert('Reset clicked')}
              onGoHome={() => alert('Go Home clicked')}
            />
          )}

          {fallbackType === 'network' && (
            <NetworkError
              error={new Error('Failed to fetch: Network request failed')}
              onReset={() => alert('Reset clicked')}
            />
          )}

          {fallbackType === 'server' && (
            <ServerError
              error={new Error('500 Internal Server Error')}
              onReset={() => alert('Reset clicked')}
            />
          )}

          {fallbackType === 'permission' && (
            <PermissionError
              error={new Error('403 Forbidden: Insufficient permissions')}
              onReset={() => alert('Reset clicked')}
            />
          )}

          {fallbackType === 'notfound' && (
            <NotFoundError
              error={new Error('404 Not Found: Resource does not exist')}
              onReset={() => alert('Reset clicked')}
            />
          )}
        </div>
      </Card>

      {/* Error Logger Test */}
      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Error Logger Test</h2>
          <p className="text-sm text-muted-foreground">
            Test the error logging API endpoint.
          </p>
        </div>

        <Button
          onClick={async () => {
            try {
              const response = await fetch('/api/errors/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message: 'Test error log from test page',
                  stack: new Error('Test error').stack,
                  timestamp: new Date().toISOString(),
                  userAgent: navigator.userAgent,
                  url: window.location.href,
                  context: {
                    testPage: true,
                    timestamp: Date.now(),
                  },
                }),
              });

              const data = await response.json();
              alert(`Error logged successfully: ${JSON.stringify(data, null, 2)}`);
            } catch (error) {
              alert(`Failed to log error: ${error}`);
            }
          }}
          variant="outline"
        >
          Test Error Logging API
        </Button>
      </Card>

      {/* Instructions */}
      <Card className="p-6 space-y-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📝 Test Instructions
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>Click error buttons to trigger React errors and see error boundary in action</li>
            <li>Check browser console for error logging output</li>
            <li>Click "Reset" to clear the error and try another test</li>
            <li>Preview different error fallback UI variants</li>
            <li>Test error logging API endpoint</li>
            <li>Verify error recovery options work correctly</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
