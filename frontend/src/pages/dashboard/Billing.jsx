import LockedCard from '../../components/LockedCard';
import { useAuth } from '../../context/AuthContext';

const Billing = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white">Billing & Plans</h1>
                <p className="text-slate-400 mt-1">Manage your subscription and payment methods</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-xl border border-brand-500/30 bg-brand-900/10 relative">
                    <div className="absolute top-4 right-4 px-2 py-1 bg-brand-500 text-white text-xs font-bold rounded">CURRENT</div>
                    <h3 className="text-xl font-bold text-white">Free Tier</h3>
                    <p className="text-brand-400 font-medium text-2xl mt-2">$0 <span className="text-sm text-slate-400 font-normal">/ month</span></p>

                    <ul className="mt-6 space-y-3 text-sm text-slate-300">
                        <li className="flex items-center gap-2">✓ 10 PDF Conversions (Lifetime)</li>
                        <li className="flex items-center gap-2">✓ 50 API Requests</li>
                        <li className="flex items-center gap-2">✓ Standard Support</li>
                    </ul>
                </div>

                {/* Locked Premium Card */}
                <div className="relative">
                    <div className="p-6 rounded-xl border border-slate-700 bg-slate-900 opacity-50 blur-[2px]">
                        <h3 className="text-xl font-bold text-white">Pro Plan</h3>
                        <p className="text-white font-medium text-2xl mt-2">$29 <span className="text-sm text-slate-400 font-normal">/ month</span></p>
                        <ul className="mt-6 space-y-3 text-sm text-slate-300">
                            <li>✓ Unlimited Conversions</li>
                            <li>✓ Unlimited API Requests</li>
                            <li>✓ Priority Support</li>
                        </ul>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-xl text-center">
                            <p className="font-bold text-white mb-2">Upgrade Locked</p>
                            <p className="text-xs text-slate-400 mb-3">Payments are currently disabled.</p>
                            <button disabled className="px-4 py-2 bg-slate-800 text-slate-500 rounded text-sm cursor-not-allowed">Upgrade Now</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8">
                <h2 className="text-xl font-bold text-white mb-4">Payment Methods</h2>
                <LockedCard
                    title="Saved Cards"
                    description="Manage your credit cards and billing usage."
                />
            </div>
        </div>
    );
};

export default Billing;
