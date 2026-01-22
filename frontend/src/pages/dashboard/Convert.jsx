import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn, formatBytes } from '../../utils/format';
import { UploadCloud, File, X, Check, Loader2, AlertCircle, Table, FileText } from 'lucide-react';
import { Button } from '../../components/Button';
import { convertPdf } from '../../api/convert.api';
import { motion, AnimatePresence } from 'framer-motion';

const Convert = () => {
    const [file, setFile] = useState(null);
    const [format, setFormat] = useState('json');
    const [mode, setMode] = useState('tables');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [jsonData, setJsonData] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles?.length) {
            setFile(acceptedFiles[0]);
            setError('');
            setSuccess(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        multiple: false
    });

    const handleConvert = async () => {
        if (!file) return;
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('format', format);
            formData.append('mode', mode);

            const response = await convertPdf(formData);

            // If JSON or Text, parse/read and show in UI
            if (format === 'json') {
                const text = await response.data.text();
                try {
                    const json = JSON.parse(text);
                    setJsonData(json);
                } catch (e) {
                    // Silent error
                }
            } else if (format === 'text') {
                const text = await response.data.text();
                // console.log('Received text content:', text);
                setJsonData(text);
            }

            // Trigger Download (only for Excel/CSV)
            if (format !== 'json' && format !== 'text') {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                const ext = format === 'excel' ? 'xlsx' : format === 'text' ? 'txt' : format;
                link.setAttribute('download', `${file.name.replace('.pdf', '')}.${ext}`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }

            setSuccess(true);
        } catch (err) {
            // console.error(err);

            let errorMessage = err.message || 'Conversion failed';

            // Try to extract error from response
            if (err.response?.data) {
                if (err.response.data instanceof Blob) {
                    try {
                        const text = await err.response.data.text();
                        const json = JSON.parse(text);
                        errorMessage = json.error || errorMessage;
                    } catch (e) {
                        // Fallback if parsing fails
                    }
                } else if (err.response.data.error) {
                    errorMessage = err.response.data.error;
                }
            }

            if (errorMessage === 'LIMIT_EXCEEDED') {
                setError('Your free limit exceed. Please upgrade to continue.');
            } else if (errorMessage && (errorMessage.includes('No tables found') || errorMessage.includes('No tables found in PDF'))) {
                setError('No tables found in the uploaded PDF. Try using "Plain Text" mode.');
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const removeFile = (e) => {
        e.stopPropagation();
        setFile(null);
        setJsonData(null);
        setSuccess(false);
        setError('');
    };

    const handleFormatChange = (newFormat) => {
        if (mode === 'text') return; // Cannot change format in text mode (it's always text)
        if (format === newFormat) return;
        setFormat(newFormat);
        setSuccess(false);
        setJsonData(null);
        setError('');
    };

    const handleModeChange = (newMode) => {
        if (mode === newMode) return;
        setMode(newMode);
        if (newMode === 'text') {
            setFormat('text');
        } else {
            setFormat('json');
        }
        setSuccess(false);
        setJsonData(null);
        setError('');
    };

    const formats = [
        { id: 'json', label: 'JSON' },
        { id: 'csv', label: 'CSV' },
        { id: 'excel', label: 'Excel (XLSX)' },
    ];

    const modes = [
        { id: 'tables', label: 'Table Extraction', icon: Table, description: 'Extract structured tables into JSON, CSV, or Excel' },
        { id: 'text', label: 'Plain Text', icon: FileText, description: 'Extract all text content from the document' },
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <header className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-white">Convert PDF</h1>
                <p className="text-slate-400">Upload your document and choose your preferred output format</p>
            </header>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                {!file ? (
                    <>
                        <div
                            {...getRootProps()}
                            className={cn(
                                "border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-200",
                                isDragActive ? "border-brand-500 bg-brand-500/10" : "border-slate-700 hover:border-brand-500/50 hover:bg-slate-800/50"
                            )}
                        >
                            <input {...getInputProps()} />
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                                <UploadCloud className="w-8 h-8 text-brand-400" />
                            </div>
                            <p className="text-lg font-medium text-white">Click to upload or drag and drop</p>
                            <p className="text-sm text-slate-500 mt-1">PDF files only (max 10MB)</p>
                        </div>

                        <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-900/20 border border-orange-800/50 text-orange-200 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p>Note: For best results, please avoid uploading PDFs with more than 5 pages as it may affect extraction quality.</p>
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        {/* File Card */}
                        <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                                    <File className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">{file.name}</p>
                                    <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
                                </div>
                            </div>

                            <button onClick={removeFile} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mode Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-300">Conversion Type</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {modes.map((m) => {
                                    const Icon = m.icon;
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => handleModeChange(m.id)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                                                mode === m.id
                                                    ? "bg-brand-600/10 border-brand-500 text-brand-100 ring-1 ring-brand-500"
                                                    : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"
                                            )}
                                        >
                                            <div className={cn("p-2 rounded-lg", mode === m.id ? "bg-brand-500 text-white" : "bg-slate-800 text-slate-500")}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className={cn("text-sm font-medium", mode === m.id ? "text-white" : "text-slate-300")}>{m.label}</p>
                                                <p className="text-xs text-slate-500">{m.description}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Options (Hidden if text mode) */}
                        <AnimatePresence>
                            {mode === 'tables' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-3 overflow-hidden"
                                >
                                    <label className="text-sm font-medium text-slate-300">Output Format</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {formats.map((f) => (
                                            <button
                                                key={f.id}
                                                onClick={() => handleFormatChange(f.id)}
                                                className={cn(
                                                    "px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                                                    format === f.id
                                                        ? "bg-brand-600 border-brand-500 text-white ring-2 ring-brand-500/30"
                                                        : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"
                                                )}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </ AnimatePresence>

                        {/* Actions */}
                        <div className="pt-4">
                            {error && (
                                <div className="mb-4 p-4 rounded-lg bg-red-900/20 border border-red-800 flex items-center gap-3 text-red-200">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-4 rounded-lg bg-green-900/20 border border-green-800 flex items-center gap-3 text-green-200"
                                >
                                    <Check className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-sm">
                                        {format === 'json' || format === 'text'
                                            ? 'Conversion successful! See output below.'
                                            : 'Conversion successful! Download started.'}
                                    </p>
                                </motion.div>
                            )}

                            <Button
                                size="lg"
                                className="w-full"
                                onClick={handleConvert}
                                loading={loading}
                            >
                                {loading ? 'Converting...' : 'Convert File Now'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* JSON Output Display */}
            {success && format === 'json' && jsonData && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">JSON Output</h3>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
                            }}
                        >
                            Copy to Clipboard
                        </Button>
                    </div>

                    <div className="relative group">
                        <pre className="p-4 rounded-xl bg-slate-900 overflow-auto max-h-[500px] text-xs sm:text-sm font-mono text-brand-100 border border-slate-800 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                            {JSON.stringify(jsonData, null, 2)}
                        </pre>
                    </div>
                </motion.div>
            )}

            {/* Text Output Display */}
            {success && format === 'text' && jsonData !== null && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Text Output</h3>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                                navigator.clipboard.writeText(jsonData);
                            }}
                        >
                            Copy to Clipboard
                        </Button>
                    </div>

                    <div className="relative group">
                        <pre className="p-4 rounded-xl bg-slate-900 overflow-auto max-h-[500px] text-xs sm:text-sm font-mono text-white border border-slate-800 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 whitespace-pre-wrap">
                            {jsonData}
                        </pre>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Convert;
