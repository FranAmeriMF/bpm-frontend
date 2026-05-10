import { forwardRef } from 'react';
import { cn } from '@utils/helpers';
import Spinner from './Spinner';

const variants = {
  primary:
    'bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-ambient hover:shadow-ambient-lg dark:bg-none dark:bg-primary',
  secondary:
    'bg-surface-container-highest text-primary hover:bg-surface-container-high',
  tertiary:
    'bg-transparent text-primary hover:bg-surface-container-low',
  error:
    'bg-error text-on-error hover:bg-error/90',
};

const sizes = {
  sm: 'px-4 py-2 text-label-sm',
  md: 'px-6 py-3 text-label-md',
  lg: 'px-8 py-4 text-label-lg',
};

const Button = forwardRef(
  ({ children, variant = 'primary', size = 'md', className, disabled, isLoading, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Spinner size="sm" className="text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
