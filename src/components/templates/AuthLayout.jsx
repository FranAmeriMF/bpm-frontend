/**
 * Layout para páginas de autenticación (Login, Reset Password).
 * Centrado con card glassmorphism.
 */
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-surface-container-low/80 backdrop-blur-glass rounded-lg shadow-ambient-lg p-8">
          {(title || subtitle) && (
            <div className="text-center mb-8">
              {title && (
                <h1 className="text-display-sm text-primary font-semibold mb-2">{title}</h1>
              )}
              {subtitle && (
                <p className="text-body-md text-on-surface-variant">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
