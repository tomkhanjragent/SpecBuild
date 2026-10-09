import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-[#131E31] text-slate-100 placeholder-slate-500 text-sm rounded-xl px-3.5 py-2.5 border transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/60 focus:border-blue-500/60 disabled:opacity-50 disabled:bg-slate-900 ${
              leftIcon ? 'pl-9' : ''
            } ${
              error
                ? 'border-rose-500/60 text-rose-200 focus:border-rose-500'
                : 'border-slate-700/60 hover:border-slate-600'
            } ${className}`}
            {...props}
          />
        </div>
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
