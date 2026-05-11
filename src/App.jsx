import AppRoutes from '@routes/AppRoutes';
import ErrorBoundary from '@components/templates/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}
