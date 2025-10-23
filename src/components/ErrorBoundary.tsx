import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
          <div className="max-w-md text-center space-y-6">
            <h1 className="text-4xl font-heading text-foreground">
              Etwas ist schiefgelaufen
            </h1>
            <p className="text-muted-foreground">
              Es ist ein unerwarteter Fehler aufgetreten. Bitte lade die Seite neu.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-premium"
            >
              Seite neu laden
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Fehlerdetails (nur in Entwicklung sichtbar)
                </summary>
                <pre className="mt-2 text-xs bg-card p-4 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
