import { Component } from 'react';
import { Button } from './ui/Button.jsx';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', this.props.name || 'app', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[12rem] flex-col items-center justify-center gap-4 rounded-2xl border border-border-subtle/70 bg-surface-muted/40 p-8 text-center">
          <div>
            <h3 className="text-heading text-ink">
              {this.props.title || 'Something went wrong'}
            </h3>
            <p className="mt-2 max-w-md text-sm text-ink-muted">
              {this.props.description ||
                'This section ran into an unexpected error. You can reload to try again.'}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onRetry?.();
              if (!this.props.onRetry) {
                window.location.reload();
              }
            }}
          >
            Reload
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
