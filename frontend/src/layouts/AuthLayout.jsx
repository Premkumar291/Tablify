import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const AuthLayout = () => {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-brand-950 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 to-slate-900/90 z-10" />
                <div className="relative z-20 max-w-lg px-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl font-bold mb-6 text-brand-100 leading-tight">
                            Transform Your <span className="text-brand-400">PDF Data</span> Instantly.
                        </h1>
                        <p className="text-xl text-slate-300">
                            Extract tables, lists, and structured data from PDFs into Excel, JSON, and CSV with 93% accuracy.
                        </p>
                    </motion.div>
                </div>
                {/* Background blobs */}
                <div className="absolute top-0 -left-20 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 relative">
                <div className="w-full max-w-md space-y-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
