/**
 * Error Boundary Component
 *
 * React error boundary for catching and handling component errors
 * gracefully without crashing the entire application.
 */

import React, { Component, ReactNode, ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Error boundary component for graceful error handling
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: NodeJS.Timeout | null = null;
  private previousResetKeys?: Array<string | number>;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };

    this.previousResetKeys = props.resetKeys;
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, componentName } = this.props;

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error(`Error in ${componentName || "component"}:`, error);
      console.error("Component stack:", errorInfo.componentStack);
    }

    // Call error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Update state with error details
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Auto-reset after 3 errors to prevent infinite loops
    if (this.state.errorCount >= 3) {
      this.scheduleReset(5000);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset on prop changes if enabled
    if (
      hasError &&
      resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      this.resetError();
      return;
    }

    // Reset if resetKeys changed
    if (hasError && resetKeys && this.previousResetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== this.previousResetKeys![index],
      );

      if (hasResetKeyChanged) {
        this.resetError();
      }
    }

    this.previousResetKeys = resetKeys;
  }

  componentWillUnmount(): void {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetError = (): void => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });
  };

  scheduleReset = (delay: number): void => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = setTimeout(() => {
      this.resetError();
    }, delay);
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, isolate, componentName } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.resetError);
      }

      // Default error UI
      return (
        <div
          className={`error-boundary-fallback ${isolate ? "isolated" : "full"}`}
        >
          <div className="bg-red-900 border border-red-500 rounded-lg p-4 m-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-red-400 font-bold mb-1">
                  {componentName
                    ? `Error in ${componentName}`
                    : "Component Error"}
                </h3>
                <p className="text-red-300 text-sm mb-2">{error.message}</p>
                <details className="text-xs text-red-200 mb-3">
                  <summary className="cursor-pointer hover:text-red-100">
                    Technical Details
                  </summary>
                  <pre className="mt-2 p-2 bg-black/30 rounded overflow-auto max-h-40">
                    {error.stack}
                  </pre>
                </details>
                <button
                  onClick={this.resetError}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                >
                  Try Again
                </button>
                {this.state.errorCount > 1 && (
                  <span className="ml-2 text-xs text-red-300">
                    (Error count: {this.state.errorCount})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook for imperative error handling
 */
export function useErrorHandler(): (error: Error) => void {
  return (error: Error) => {
    throw error; // Will be caught by nearest error boundary
  };
}
