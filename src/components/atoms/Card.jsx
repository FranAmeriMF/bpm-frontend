import { cn } from '@utils/helpers';

const Card = ({ children, className, elevated = false, onClick, ...props }) => {
  return (
    <div
      className={cn(
        'rounded overflow-hidden transition-all duration-200',
        'bg-surface-container-low',
        elevated && 'shadow-ambient',
        elevated && onClick && 'hover:shadow-ambient-lg',
        onClick && 'cursor-pointer hover:bg-surface-container',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
