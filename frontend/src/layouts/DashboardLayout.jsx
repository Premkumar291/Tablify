import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Menu } from 'lucide-react';

const DashboardLayout = () => {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 flex">
            {/* Mobile Header / Overlay */}
            <div className="md:hidden fixed top-0 w-full z-20 flex items-center p-4 bg-[#0f172a] border-b border-slate-800">
                <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
                    <Menu className="w-6 h-6" />
                </button>
                <span className="ml-4 font-bold text-white">Tablify</span>
            </div>

            <Navbar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-screen mt-16 md:mt-0">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
