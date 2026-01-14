import { BarChart3 } from 'lucide-react';

const Usage = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white">Usage Analytics</h1>
                <p className="text-slate-400 mt-1">Track your consumption against your plan limits</p>
            </header>

            <div className="p-12 text-center border border-dashed border-slate-700 rounded-xl bg-slate-900/50">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-white">Analytics Dashboard</h3>
                <p className="text-slate-400 max-w-md mx-auto mt-2">
                    Detailed usage charts and analytics are coming soon. You can view your summary in the dashboard overview.
                </p>
            </div>
        </div>
    );
};

export default Usage;
