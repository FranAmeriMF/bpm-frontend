import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@utils/helpers';

const SearchBar = ({ placeholder = 'Buscar...', value, onChange, onClear, className }) => {
  return (
    <div className={cn('relative', className)}>
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-10 py-3 rounded bg-surface-container-lowest text-on-surface text-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 hover:bg-surface-container-low transition-all duration-200"
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-surface-container transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <XMarkIcon className="h-4 w-4 text-on-surface-variant" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
