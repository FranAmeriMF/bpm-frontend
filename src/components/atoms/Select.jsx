import { forwardRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@utils/helpers';

const Select = forwardRef(
  ({ label, error, helperText, className, required, options = [], placeholder, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-label-md text-on-surface-variant">
            {label}
            {required && <span className="ml-1 text-error">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full pl-4 pr-10 py-3 rounded-sm appearance-none',
              'bg-surface-container-lowest text-on-surface text-body-md',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/40',
              error
                ? 'bg-error-container/10 ring-2 ring-error/40'
                : 'hover:bg-surface-container-low',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="">{placeholder}</option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
        </div>
        {error && <p className="text-label-sm text-error px-1">{error}</p>}
        {helperText && !error && (
          <p className="text-label-sm text-on-surface-variant px-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
