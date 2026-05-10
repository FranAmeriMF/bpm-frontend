import { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@utils/helpers';

const Tabs = ({ tabs, defaultTab }) => {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  const current = tabs.find((t) => t.id === active);

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-outline-variant/40">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              'px-4 py-2.5 text-label-md font-medium transition-colors border-b-2 -mb-px',
              active === tab.id
                ? 'text-primary border-primary'
                : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{current?.content}</div>
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
    }),
  ).isRequired,
  defaultTab: PropTypes.string,
};

export default Tabs;
