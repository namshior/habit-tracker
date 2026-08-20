import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed rounded-lg active:scale-[0.98] select-none';

    const variants = {
      primary:
        'bg-primary-600 hover:bg-primary-500 text-white shadow-glow hover:shadow-primary-500/25 focus-visible:ring-primary-500',
      secondary:
        'bg-surface hover:bg-surface-hover text-slate-200 border border-border focus-visible:ring-slate-400',
      outline:
        'border border-border hover:bg-surface-hover text-slate-300 hover:text-white focus-visible:ring-slate-400',
      ghost:
        'text-slate-400 hover:text-slate-100 hover:bg-surface/60 focus-visible:ring-slate-400',
      danger:
        'bg-danger-600/90 hover:bg-danger-500 text-white focus-visible:ring-danger-500',
      success:
        'bg-success-600 hover:bg-success-500 text-white shadow-glow-success focus-visible:ring-success-500',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
