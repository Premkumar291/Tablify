import { useState, useEffect } from 'react';
import { getApiKeys, generateApiKey } from '../../api/apiKeys.api';
import { Button } from '../../components/Button';
import { Key, Copy, Check, Plus, AlertTriangle } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import LockedCard from '../../components/LockedCard';
import { motion } from 'framer-motion';

const ApiKeys = () => {
    const { user } = useAuth();
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [keyName, setKeyName] = useState('');
    const [error, setError] = useState('');
    const [newKey, setNewKey] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const { data } = await getApiKeys();
            setKeys(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!keyName.trim()) {
            setError("Please name your API Key");
            return;
        }
        setCreating(true);
        setError('');
        try {
            const { data } = await generateApiKey(keyName);
            setNewKey(data.apiKey);
            setShowCreate(false);
            setKeyName('');
            fetchKeys();
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to generate key');
        } finally {
            setCreating(false);
        }
    };

    const handleCopy = () => {
        if (newKey) {
            navigator.clipboard.writeText(newKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">API Keys</h1>
                    <p className="text-slate-400 mt-1">Manage your programmatic access keys</p>
                </div>
                <Button onClick={() => setShowCreate(true)} disabled={showCreate || keys.length >= 5} title={keys.length >= 5 ? "Limit reached" : ""}>
                    <Plus className="w-4 h-4 mr-2" /> Generate New Key
                </Button>
            </header>

            {showCreate && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4"
                >
                    <h3 className="text-lg font-semibold text-white">Create New API Key</h3>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Key Name (e.g. My App)"
                            className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                            value={keyName}
                            onChange={(e) => setKeyName(e.target.value)}
                        />
                        <Button onClick={handleCreate} loading={creating}>Create</Button>
                        <Button variant="ghost" onClick={() => { setShowCreate(false); setError(''); }}>Cancel</Button>
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                </motion.div>
            )}

            {newKey && (
                <div className="p-6 bg-brand-900/10 border border-brand-500/30 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-brand-400 w-5 h-5 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-brand-400">Save your key immediately</h3>
                            <p className="text-sm text-slate-300 mt-1">This key will not be displayed again. If you lose it, you'll need to generate a new one.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-sm text-white break-all">
                            {newKey}
                        </code>
                        <Button variant="secondary" onClick={handleCopy}>
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center p-8 text-slate-500">Loading keys...</div>
                ) : keys.length === 0 ? (
                    <div className="text-center p-12 bg-slate-900 rounded-xl border border-slate-800">
                        <Key className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-white font-medium">No API Keys Found</h3>
                        <p className="text-slate-500 mt-1">Generate your first key to start using the API.</p>
                    </div>
                ) : (
                    keys.map((key) => (
                        <div key={key._id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                    <Key className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-white truncate">{key.name}</p>
                                    <p className="text-sm text-slate-400 font-mono truncate">{key.prefix}****************</p>
                                    <p className="text-xs text-slate-500">Created {formatDate(key.createdAt)}</p>
                                </div>
                            </div>
                            <div className="text-left md:text-right pl-14 md:pl-0">
                                <p className="text-sm font-medium text-white">{key.usageCount} Requests</p>
                                <p className="text-xs text-slate-500">Usage Count</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ApiKeys;
