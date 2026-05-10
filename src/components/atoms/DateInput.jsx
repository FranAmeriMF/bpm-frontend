import PropTypes from 'prop-types';
import { cn } from '@utils/helpers';

const DateInput = ({ label, value, onChange, className }) => (
  <div className={cn('flex items-center gap-2', className)}>
    {label && (
      <label className="text-label-sm text-on-surface-variant whitespace-nowrap">{label}</label>
    )}
    <input
      type="date"
      className="rounded px-2 py-1.5 text-body-sm bg-surface border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/30 text-on-surface"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

DateInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default DateInput;
