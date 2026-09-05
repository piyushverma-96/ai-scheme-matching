import React from 'react';

/**
 * Tooltip wrapper — shows tooltip text on hover/focus.
 * children: the trigger element (icon, label, etc.)
 * tip: the tooltip text string
 */
export default function Tooltip({ tip, children }) {
  return (
    <span className="tooltip-wrapper" tabIndex={0} role="button" aria-label={tip}>
      {children}
      <span className="tooltip-text" role="tooltip">{tip}</span>
    </span>
  );
}
