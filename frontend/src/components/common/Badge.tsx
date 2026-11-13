import React from 'react';
import { getCategoryStyle } from '../../utils/colors';

interface BadgeProps {
  category?: string | null;
  aqi?: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ category, aqi, size = 'md', className = '' }) => {
  const style = getCategoryStyle(aqi);
  const displayLabel = category || style.label;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3.5 py-1.5 text-sm font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${sizeClasses} ${className}`}
      style={{
        backgroundColor: style.bgColor,
        borderColor: style.borderColor,
        color: style.textColor,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: style.color }}
      />
      {displayLabel}
    </span>
  );
};

