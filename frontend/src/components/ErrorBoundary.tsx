import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("UI crashed:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground px-6 py-16">
          <div className="mx-auto max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">something went wrong</p>
            <h1 className="mt-3 text-3xl font-bold">The page crashed</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              This usually happens when the backend returns empty data. The static fallback should have prevented it – please reload.
            </p>
            <pre className="mt-6 max-h-64 overflow-auto rounded-md border border-border bg-surface p-4 font-mono text-xs text-muted-foreground">
              {this.state.error?.message}
              {"\n"}
              {this.state.error?.stack}
            </pre>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => location.reload()}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Reload
              </button>
              <a href="/" className="rounded-md border border-border px-4 py-2 text-sm">
                Go home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
