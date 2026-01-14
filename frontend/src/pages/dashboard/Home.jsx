import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { FileText, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <p className="text-slate-400">Welcome back, {user?.name || user?.email.split('@')[0]}</p>
            </header>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-brand-900/50 to-slate-900 border border-brand-900/50 relative overflow-hidden group cursor-pointer"
                    onClick={() => navigate('/dashboard/convert')}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-brand-500/20" />

                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Convert PDF</h3>
                            <p className="text-sm text-slate-400 mt-1">Extract data tables instantly</p>
                        </div>
                        <Button variant="ghost" className="p-0 text-brand-400 hover:text-brand-300 hover:bg-transparent">
                            Start Conversion <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </motion.div>

                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">API Usage</h3>
                        <p className="text-sm text-slate-400 mt-1">Monitor your programmatic access</p>
                    </div>
                    <Button variant="secondary" className="w-full" onClick={() => navigate('/dashboard/usage')}>
                        View Analytics
                    </Button>
                </div>

                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Current Plan</h3>
                        <p className="text-sm text-slate-400 mt-1">You are on the <span className="font-bold text-white">{user?.plan}</span> tier</p>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/billing')}>
                        Manage Subscription
                    </Button>
                </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-901 border border-slate-800/50 bg-[url('/grid.svg')]">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2">
                    <FileText className="w-8 h-8 opacity-20" />
                    <p>No recent conversions found.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
