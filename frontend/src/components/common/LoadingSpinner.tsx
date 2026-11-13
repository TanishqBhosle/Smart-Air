import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading intelligence data...',
  size = 'md',
}) => {
  const spinnerSize = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-slate-400">
      <div
        className={`${spinnerSize} rounded-full border-emerald-500/20 border-t-emerald-500 animate-spin`}
      />
      {label && <span className="text-sm font-medium tracking-wide">{label}</span>}
    </div>
  );
};

