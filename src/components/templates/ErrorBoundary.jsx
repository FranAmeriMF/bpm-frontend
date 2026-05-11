import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="text-center space-y-5 max-w-sm">
          <p className="text-[8rem] leading-none font-bold text-outline-variant select-none">!</p>
          <div className="space-y-2">
            <h1 className="text-headline-sm text-on-surface font-medium">Algo salió mal</h1>
            <p className="text-body-md text-on-surface-variant">
              Ocurrió un error inesperado. Podés intentar volver al inicio.
            </p>
            {import.meta.env.DEV && (
              <pre className="mt-3 text-left text-body-sm text-error bg-error-container/30 rounded p-3 overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary text-label-md shadow-ambient hover:shadow-ambient-lg transition-shadow dark:from-primary-container dark:text-on-primary-container"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
