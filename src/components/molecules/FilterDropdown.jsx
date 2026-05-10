import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@utils/helpers';

/**
 * Dropdown estilizado para filtros (no para forms — usar Select para eso).
 * options: [{ value, label }]
 * value: string | null
 */
const FilterDropdown = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Todos',
  className,
}) => {
  const selected = options.find((o) => o.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={cn('relative', className)}>
        {label && (
          <span className="block text-label-md text-on-surface-variant mb-1.5">{label}</span>
        )}
        <Listbox.Button className="relative w-full px-4 py-3 rounded bg-surface-container-lowest text-left text-body-md text-on-surface hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200">
          <span className={cn(!selected && 'text-on-surface-variant/60')}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronUpDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-20 mt-1 w-full bg-surface-container-low rounded shadow-ambient-lg focus:outline-none max-h-60 overflow-auto py-1">
            {/* Opción "Todos" para limpiar el filtro */}
            <Listbox.Option value={null} as={Fragment}>
              {({ active }) => (
                <li
                  className={cn(
                    'px-4 py-2.5 text-body-md cursor-pointer flex items-center gap-2',
                    active && 'bg-surface-container'
                  )}
                >
                  <CheckIcon
                    className={cn('h-4 w-4 text-primary flex-shrink-0', value == null ? 'opacity-100' : 'opacity-0')}
                  />
                  <span className="text-on-surface-variant">{placeholder}</span>
                </li>
              )}
            </Listbox.Option>
            {options.map((opt) => (
              <Listbox.Option key={opt.value} value={opt.value} as={Fragment}>
                {({ active, selected: isSelected }) => (
                  <li
                    className={cn(
                      'px-4 py-2.5 text-body-md cursor-pointer flex items-center gap-2',
                      active && 'bg-surface-container'
                    )}
                  >
                    <CheckIcon
                      className={cn('h-4 w-4 text-primary flex-shrink-0', isSelected ? 'opacity-100' : 'opacity-0')}
                    />
                    {opt.label}
                  </li>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default FilterDropdown;
