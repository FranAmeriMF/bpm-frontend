import { forwardRef } from 'react';
import { cn } from '@utils/helpers';

const Textarea = forwardRef(
  ({ label, error, helperText, className, required, rows = 4, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-label-md text-on-surface-variant">
            {label}
            {required && <span className="ml-1 text-error">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'w-full px-4 py-3 rounded-sm resize-y',
            'bg-surface-container-lowest text-on-surface text-body-md',
            'placeholder:text-on-surface-variant/50',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/40',
            error
              ? 'bg-error-container/10 ring-2 ring-error/40'
              : 'hover:bg-surface-container-low',
            className
          )}
          {...props}
        />
        {error && <p className="text-label-sm text-error px-1">{error}</p>}
        {helperText && !error && (
          <p className="text-label-sm text-on-surface-variant px-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
