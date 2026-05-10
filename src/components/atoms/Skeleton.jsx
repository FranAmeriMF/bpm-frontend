import { cn } from '@utils/helpers';

const Skeleton = ({ className }) => (
  <div className={cn('animate-pulse bg-surface-container-high rounded', className)} />
);

export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div className="overflow-x-auto rounded shadow-ambient">
    <table className="w-full">
      <thead>
        <tr className="bg-surface-container">
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="px-4 py-3">
              <Skeleton className="h-4 w-20" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/20">
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i} className="bg-surface">
            {Array.from({ length: cols }).map((_, j) => (
              <td key={j} className="px-4 py-3">
                <Skeleton className={cn('h-4', j === 0 ? 'w-24' : j === cols - 1 ? 'w-12' : 'w-full max-w-[140px]')} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const SkeletonCard = ({ lines = 3 }) => (
  <div className="bg-surface-container-low rounded shadow-ambient p-6 space-y-3">
    <Skeleton className="h-5 w-1/3" />
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} />
    ))}
  </div>
);

export default Skeleton;
