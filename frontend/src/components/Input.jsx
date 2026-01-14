import React from 'react';
import { cn } from '../utils/format';

export const Input = React.forwardRef(({ className, error, label, ...props }, ref) => {
    return (
        <div className="w-full space-y-1">
            {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
            <input
                className={cn(
                    'flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all duration-200 hover:border-slate-600',
                    error && 'border-red-500 focus:ring-red-500/50',
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';
