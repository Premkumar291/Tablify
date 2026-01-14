import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';
import { cn } from '../utils/format';
import { Home, FileText, Key, CreditCard, LogOut, LayoutGrid, X } from 'lucide-react';

const Navbar = ({ isOpen, onClose }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { label: 'Overview', path: '/dashboard', icon: LayoutGrid },
        { label: 'Convert', path: '/dashboard/convert', icon: FileText },
        { label: 'API Keys', path: '/dashboard/api-keys', icon: Key },
        { label: 'Documentation', path: '/dashboard/docs', icon: FileText },
        { label: 'Usage & Billing', path: '/dashboard/billing', icon: CreditCard },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {/* Mobile Overlay Removed */}

            <nav className={cn(
                "h-screen w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col fixed left-0 top-0 z-30 transition-transform duration-300 ease-in-out md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                                <FileText className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                Tablify
                            </span>
                        </div>
                        {/* Mobile Close Button */}
                        <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => onClose()} // Close on navigation (mobile)
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                                        isActive
                                            ? 'bg-brand-900/20 text-brand-400'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                    )}
                                >
                                    <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300')} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-auto p-6 border-t border-slate-800">
                    <div className="mb-4 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate" title={user?.email}>{user?.email}</p>
                        <span className="text-[10px] uppercase tracking-wider text-brand-400 font-bold">{user?.plan} PLAN</span>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/10"
                        onClick={logout}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
