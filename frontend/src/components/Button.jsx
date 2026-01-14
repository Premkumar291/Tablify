import React from 'react';
import { cn } from '../utils/format';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', loading, children, ...props }, ref) => {
    const variants = {
        primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/20 active:scale-95',
        secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95',
        outline: 'border-2 border-brand-600 text-brand-400 hover:bg-brand-950/30 active:scale-95',
        ghost: 'hover:bg-slate-800/50 text-slate-400 hover:text-white',
        danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-8 text-lg',
    };

    return (
        <motion.button
            ref={ref}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={loading}
            {...props}
        >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </motion.button>
    );
});

Button.displayName = 'Button';
