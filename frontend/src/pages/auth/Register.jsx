import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(email, password, name);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white">Create an account</h2>
                <p className="text-slate-400">Start converting your PDFs for free today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm">
                        {error}
                    </div>
                )}
                <Input
                    label="Email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    label="Full Name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    rightElement={
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="focus:outline-none hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    }
                />
                <Button
                    type="submit"
                    className="w-full bg-brand-600 hover:bg-brand-500"
                    loading={loading}
                >
                    Create Account
                </Button>
            </form>

            <p className="text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
                    Sign In
                </Link>
            </p>
        </motion.div>
    );
};

export default Register;
