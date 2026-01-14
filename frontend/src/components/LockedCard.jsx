import { Lock, CreditCard } from 'lucide-react';
import { Button } from './Button';

const LockedCard = ({ title, description }) => {
    return (
        <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-8 text-center shadow-lg">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 ring-4 ring-slate-800/50">
                    <Lock className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Feature Locked</h3>
                <p className="text-slate-400 max-w-sm mb-6">
                    This feature requires a Premium subscription. Upgrade your plan to access unlimited conversions and API keys.
                </p>
                <Button disabled className="opacity-50 cursor-not-allowed bg-brand-600 text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Payments Coming Soon
                </Button>
            </div>

            {/* Decorative Background Content (Blurred out) */}
            <div className="blur-sm opacity-50 select-none">
                <h3 className="text-lg font-bold text-white mb-4 text-left">{title}</h3>
                <p className="text-slate-400 text-left mb-4">{description}</p>
                <div className="h-32 w-full bg-slate-800 rounded-lg animate-pulse"></div>
            </div>
        </div>
    );
};

export default LockedCard;
