import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={twMerge(
            clsx(
              'w-full bg-surface border border-border rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors',
              error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500',
              className
            )
          )}
          {...props}
        />
        {error ? <p className="text-xs text-danger-400 mt-1">{error}</p> : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
