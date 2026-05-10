import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@utils/helpers';

/**
 * Paginación sincronizada con el formato del backend: { data, total, page, limit, totalPages }
 */
const Pagination = ({ page, totalPages, total, limit, onPageChange }) => {
  if (total == null) return null;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  const pageNumbers = () => {
    const count = Math.min(totalPages, 5);
    let start;
    if (totalPages <= 5)          start = 1;
    else if (page <= 3)           start = 1;
    else if (page >= totalPages - 2) start = totalPages - 4;
    else                          start = page - 2;
    return Array.from({ length: count }, (_, i) => start + i);
  };

  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-body-sm text-on-surface-variant">
        {total === 0 ? 'Sin resultados' : <span>Mostrando {from}–{to} de {total} resultado{total === 1 ? '' : 's'}</span>}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Página anterior"
          >
            <ChevronLeftIcon className="h-5 w-5 text-on-surface-variant" />
          </button>

          {pageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'w-9 h-9 rounded text-body-sm font-medium transition-colors',
                page === p
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container'
              )}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Página siguiente"
          >
            <ChevronRightIcon className="h-5 w-5 text-on-surface-variant" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
