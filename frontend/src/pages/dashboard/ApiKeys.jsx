import { useState, useEffect } from 'react';
import { getApiKeys, generateApiKey, deleteApiKey } from '../../api/apiKeys.api';
import { Button } from '../../components/Button';
import { Key, Copy, Check, Plus, AlertTriangle, Trash, X } from 'lucide-react';
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

    // Stores the ID and full string of the newly created key
    const [revealedKey, setRevealedKey] = useState(null);
    const [copied, setCopied] = useState(false);

    const [deleteKeyId, setDeleteKeyId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const { data } = await getApiKeys();
            setKeys(data);
        } catch (error) {
            // Silent error
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
            setKeys([data.key, ...keys]);
            setRevealedKey({ id: data.key._id, key: data.apiKey });
            setShowCreate(false);
            setKeyName('');
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to generate key');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteKeyId(id);
    };

    const confirmDelete = async () => {
        if (!deleteKeyId) return;
        setIsDeleting(true);
        try {
            await deleteApiKey(deleteKeyId);
            setKeys(keys.filter(k => k._id !== deleteKeyId));
            if (revealedKey?.id === deleteKeyId) setRevealedKey(null);
            setDeleteKeyId(null);
        } catch (error) {
            // Silent error
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 relative">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">API Keys</h1>
                    <p className="text-slate-400 mt-1">Manage your programmatic access keys</p>
                </div>
                <Button onClick={() => setShowCreate(true)} disabled={showCreate || keys.length >= 3} title={keys.length >= 3 ? "Limit reached" : ""}>
                    <Plus className="w-4 h-4 mr-2" /> Generate New Key
                </Button>
            </header>

            {/* Delete Confirmation Modal */}
            {deleteKeyId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4"
                    >
                        <div className="flex items-center gap-3 text-red-400">
                            <div className="p-2 rounded-lg bg-red-900/20">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold">Revoke API Key?</h3>
                        </div>
                        <p className="text-slate-300">
                            Are you sure you want to delete this API key? Any applications using it will immediately lose access. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" onClick={() => setDeleteKeyId(null)} disabled={isDeleting}>Cancel</Button>
                            <Button
                                className="bg-red-600 hover:bg-red-500 text-white"
                                onClick={confirmDelete}
                                loading={isDeleting}
                            >
                                Yes, Delete Key
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}

            {showCreate && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4"
                >
                    <h3 className="text-lg font-semibold text-white">Create New API Key</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Key Name (e.g. My App)"
                            className="w-full sm:flex-1 bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                            value={keyName}
                            onChange={(e) => setKeyName(e.target.value)}
                        />
                        <div className="flex gap-2 shrink-0">
                            <Button onClick={handleCreate} loading={creating} className="flex-1 sm:flex-none">Create</Button>
                            <Button variant="ghost" onClick={() => { setShowCreate(false); setError(''); }} className="flex-1 sm:flex-none">Cancel</Button>
                        </div>
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                </motion.div>
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
                    keys.map((key) => {
                        const isRevealed = revealedKey?.id === key._id;
                        return (
                            <div
                                key={key._id}
                                className={`p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border transition-colors ${isRevealed ? 'bg-brand-900/10 border-brand-500/50' : 'bg-slate-900 border-slate-800'}`}
                            >
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0">
                                        <Key className={`w-5 h-5 ${isRevealed ? 'text-brand-400' : 'text-slate-400'}`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-semibold text-white truncate max-w-full">{key.name}</p>
                                            {isRevealed && <span className="text-xs bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded shrink-0">New</span>}
                                        </div>

                                        {isRevealed ? (
                                            <div className="flex items-center gap-2 mt-2 flex-wrap sm:flex-nowrap">
                                                <code className="bg-slate-950 px-2 py-1 rounded text-sm text-brand-200 font-mono break-all border border-brand-500/30">
                                                    {revealedKey.key}
                                                </code>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button onClick={() => handleCopy(revealedKey.key)} className="p-1 text-slate-400 hover:text-white" title="Copy Key">
                                                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => setRevealedKey(null)} className="p-1 text-slate-400 hover:text-white" title="Hide Key">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 font-mono truncate mt-1">
                                                {key.prefix ? key.prefix + '****************' : '****************'}
                                            </p>
                                        )}

                                        {!isRevealed && <p className="text-xs text-slate-500 mt-1">Created {formatDate(key.createdAt)}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0 pl-14 sm:pl-0 border-t sm:border-t-0 border-slate-800/50 pt-3 sm:pt-0">
                                    <div className="text-left sm:text-right">
                                        <p className="text-sm font-medium text-white">{key.usageCount || 0} Requests</p>
                                        <p className="text-xs text-slate-500">Usage Count</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400 hover:bg-red-900/10 shrink-0" onClick={() => handleDeleteClick(key._id)}>
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ApiKeys;
