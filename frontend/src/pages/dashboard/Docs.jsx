import { useState } from 'react';
import { cn } from '../../utils/format';
import { Copy, Check, Terminal, Code2 } from 'lucide-react';
import { Button } from '../../components/Button';

const Docs = () => {
    const [copied, setCopied] = useState(null);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const convertEndpoint = `${apiUrl}/convert`;

    const codeExamples = {
        curl: `curl -X POST ${convertEndpoint} \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "file=@/path/to/invoice.pdf" \\
  -F "format=json"`,

        python: `import requests

url = "${convertEndpoint}"
files = {'file': open('invoice.pdf', 'rb')}
payload = {'format': 'json'}
headers = {'x-api-key': 'YOUR_API_KEY'}

response = requests.post(url, headers=headers, data=payload, files=files)
print(response.json())`,

        node: `const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const form = new FormData();
form.append('file', fs.createReadStream('invoice.pdf'));
form.append('format', 'json');

const response = await axios.post('${convertEndpoint}', form, {
    headers: {
        ...form.getHeaders(),
        'x-api-key': 'YOUR_API_KEY'
    }
});

console.log(response.data);`
    };

    const responseExample = `{
  "file_content": [
    {
      "Invoice Number": "INV-001",
      "Date": "2023-10-25",
      "Total": "$500.00"
    }
  ],
  "content_type": "application/json",
  "filename": "output.json",
  "is_base64": false
}`;

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <header className="space-y-4">
                <h1 className="text-4xl font-bold text-white">Integration Guide</h1>
                <p className="text-lg text-slate-400">
                    Follow this step-by-step guide to integrate Tablify into your application.
                </p>
            </header>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Step 1 */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
                    <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-lg border border-brand-500/30">1</div>
                    <h3 className="text-xl font-semibold text-white">Generate API Key</h3>
                    <p className="text-slate-400 text-sm">Go to the <strong>API Keys</strong> section, create a new key, and copy it immediately. You'll need this to authenticate your requests.</p>
                </div>
                {/* Step 2 */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
                    <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-lg border border-brand-500/30">2</div>
                    <h3 className="text-xl font-semibold text-white">Prepare Request</h3>
                    <p className="text-slate-400 text-sm">Construct a POST request to <code className="text-xs bg-slate-950 px-1 py-0.5 rounded border border-slate-800">/api/convert</code>. Include your PDF file and the <code className="text-xs bg-slate-950 px-1 py-0.5 rounded border border-slate-800">x-api-key</code> header.</p>
                </div>
                {/* Step 3 */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
                    <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-lg border border-brand-500/30">3</div>
                    <h3 className="text-xl font-semibold text-white">Handle Response</h3>
                    <p className="text-slate-400 text-sm">Receive the structured data (JSON, Excel, etc.) directly in your application and integrate it into your workflow.</p>
                </div>
            </div>

            {/* Authentication Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <KeyIcon className="w-6 h-6 text-brand-400" />
                    Authentication
                </h2>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <p className="text-slate-300 mb-4">
                        Authenticate your requests by including your API key in the <code className="text-brand-300 bg-brand-900/20 px-1.5 py-0.5 rounded">x-api-key</code> header.
                    </p>
                    <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-sm text-slate-400">
                        x-api-key: <span className="text-brand-400">sk_test_...</span>
                    </div>
                </div>
            </section>

            {/* Endpoint Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Terminal className="w-6 h-6 text-blue-400" />
                    Convert PDF Endpoint
                </h2>

                <div className="flex items-center gap-3">
                    <span className="bg-green-500/10 text-green-400 font-bold px-3 py-1 rounded text-sm border border-green-500/20">POST</span>
                    <code className="text-white bg-slate-800 px-3 py-1 rounded hidden md:inline">{convertEndpoint}</code>
                    <code className="text-white bg-slate-800 px-3 py-1 rounded md:hidden text-xs">{convertEndpoint.replace(window.location.origin, '')}</code>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="border-b border-slate-800 p-4 bg-slate-900/50">
                        <h3 className="font-semibold text-white">Request Parameters (Multipart/Form-Data)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                            <thead className="bg-slate-950 text-slate-400 font-medium">
                                <tr>
                                    <th className="p-4">Key</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Required</th>
                                    <th className="p-4 min-w-[200px]">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                                <tr>
                                    <td className="p-4 font-mono text-brand-300">file</td>
                                    <td className="p-4">File (Binary)</td>
                                    <td className="p-4 text-brand-400">Yes</td>
                                    <td className="p-4">The PDF file to process (Max 10MB).</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-mono text-brand-300">format</td>
                                    <td className="p-4">String</td>
                                    <td className="p-4 text-slate-500">No</td>
                                    <td className="p-4">
                                        Output format. Default is <code className="bg-slate-800 px-1 py-0.5 rounded text-xs">json</code>.<br />
                                        Options: <code className="text-xs">json, csv, excel, text</code>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Code Examples */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Code2 className="w-6 h-6 text-purple-400" />
                    Code Examples
                </h2>

                <div className="space-y-8">
                    {/* cURL */}
                    <CodeBlock
                        title="cURL"
                        language="bash"
                        code={codeExamples.curl}
                        id="curl"
                        copied={copied}
                        onCopy={handleCopy}
                    />

                    {/* Python */}
                    <CodeBlock
                        title="Python (requests)"
                        language="python"
                        code={codeExamples.python}
                        id="python"
                        copied={copied}
                        onCopy={handleCopy}
                    />

                    {/* Node */}
                    <CodeBlock
                        title="Node.js (axios)"
                        language="javascript"
                        code={codeExamples.node}
                        id="node"
                        copied={copied}
                        onCopy={handleCopy}
                    />
                </div>
            </section>

            {/* Response Section */}
            <section className="space-y-4">
                <h3 className="text-xl font-bold text-white">Example Response (JSON)</h3>
                <div className="relative group">
                    <pre className="p-4 rounded-xl bg-slate-950 overflow-auto text-sm font-mono text-green-300 border border-slate-800">
                        {responseExample}
                    </pre>
                </div>
            </section>
        </div>
    );
};

const KeyIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.5" cy="15.5" r="5.5"></circle>
        <path d="m21 2-9.6 9.6"></path>
        <path d="m15.5 7.5 3 3L22 7l-3-3"></path>
    </svg>
);

const CodeBlock = ({ title, language, code, id, copied, onCopy }) => (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
            <span className="text-sm font-medium text-slate-300">{title}</span>
            <Button size="sm" variant="ghost" onClick={() => onCopy(code, id)}>
                {copied === id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                <span className="ml-2">{copied === id ? 'Copied' : 'Copy'}</span>
            </Button>
        </div>
        <div className="p-4 overflow-x-auto">
            <pre className={`text-sm font-mono text-slate-300 language-${language}`}>
                {code}
            </pre>
        </div>
    </div>
);

export default Docs;
