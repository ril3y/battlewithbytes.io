'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { getWasmErrorMessage } from '../lib/wasm-loader';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WasmErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WasmErrorBoundary caught an error:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <DefaultWasmErrorFallback 
          error={this.state.error} 
          reset={this.reset} 
        />
      );
    }

    return this.props.children;
  }
}

function DefaultWasmErrorFallback({ 
  error, 
  reset 
}: { 
  error: Error; 
  reset: () => void;
}) {
  const message = getWasmErrorMessage(error);
  
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md w-full bg-red-900/20 border border-red-500/30 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg 
              className="w-6 h-6 text-red-400" 
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
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-300 mb-2">
              Failed to Load BattleMagic
            </h3>
            
            <p className="text-red-200/80 text-sm mb-4">
              {message}
            </p>
            
            <details className="mb-4">
              <summary className="text-xs text-red-300/60 cursor-pointer hover:text-red-300/80">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs text-red-200/60 bg-black/30 p-2 rounded overflow-auto max-h-32">
                {error.stack || error.message}
              </pre>
            </details>
            
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm font-medium transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
