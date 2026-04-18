'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component for catching React errors
 *
 * Features:
 * - Catches errors in child components
 * - Displays user-friendly error UI
 * - Reset functionality
 * - Development error details
 * - Custom fallback support
 * - Glassmorphism styling
 *
 * @example
 * <ErrorBoundary>
 *   <YourApp />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Log to error reporting service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
          <div className="glass-heavy rounded-2xl p-8 max-w-2xl w-full text-center border border-white/10 shadow-2xl">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-danger/20 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-danger" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold mb-3 text-text-primary">
              Щось пішло не так
            </h1>

            {/* Description */}
            <p className="text-text-secondary mb-8 text-lg">
              Вибачте за незручності. Ми вже працюємо над виправленням цієї помилки.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                onClick={() => window.location.reload()}
                icon={<RefreshCw className="w-4 h-4" />}
                size="lg"
                variant="primary"
              >
                Перезавантажити сторінку
              </Button>

              <Button
                onClick={() => (window.location.href = '/')}
                icon={<Home className="w-4 h-4" />}
                size="lg"
                variant="glass"
              >
                Повернутися на головну
              </Button>

              {process.env.NODE_ENV === 'development' && (
                <Button
                  onClick={this.resetError}
                  size="lg"
                  variant="ghost"
                >
                  Спробувати знову
                </Button>
              )}
            </div>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left mt-8">
                <summary className="cursor-pointer text-sm font-medium text-text-tertiary hover:text-primary transition-colors">
                  Деталі помилки (тільки для розробки)
                </summary>
                <div className="mt-4 p-4 glass-subtle rounded-lg">
                  {/* Error Message */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-danger mb-2">
                      Error Message:
                    </h3>
                    <pre className="text-xs overflow-auto p-3 glass-light rounded-lg text-text-primary">
                      {this.state.error.toString()}
                    </pre>
                  </div>

                  {/* Stack Trace */}
                  {this.state.error.stack && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-danger mb-2">
                        Stack Trace:
                      </h3>
                      <pre className="text-xs overflow-auto p-3 glass-light rounded-lg text-text-primary max-h-64">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}

                  {/* Component Stack */}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h3 className="text-sm font-semibold text-danger mb-2">
                        Component Stack:
                      </h3>
                      <pre className="text-xs overflow-auto p-3 glass-light rounded-lg text-text-primary max-h-64">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Help Text */}
            <p className="text-xs text-text-tertiary mt-8">
              Якщо проблема повторюється, будь ласка, зв'яжіться з підтримкою.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional Error Boundary wrapper (for use with hooks)
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: Error, reset: () => void) => ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Example usage:
 *
 * // Wrap your app
 * export default function App() {
 *   return (
 *     <ErrorBoundary>
 *       <YourApp />
 *     </ErrorBoundary>
 *   );
 * }
 *
 * // With custom fallback
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <h1>Custom Error: {error.message}</h1>
 *       <button onClick={reset}>Try Again</button>
 *     </div>
 *   )}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * // As HOC
 * const SafeComponent = withErrorBoundary(MyComponent);
 */
