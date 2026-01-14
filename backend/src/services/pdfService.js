import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const processPdf = (fileBuffer, format) => {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, '../python/pdf_processor.py');
        const pythonProcess = spawn('python3', [pythonScript, '--format', format]);

        // Feed Buffer
        pythonProcess.stdin.write(fileBuffer);
        pythonProcess.stdin.end();

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
            console.error('[Python Error Details]:', data.toString());
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}. Stderr: ${errorString}`);
                return reject(new Error(`Python Script Error: ${errorString}`));
            }

            try {
                const result = JSON.parse(dataString);
                if (result.error) {
                    return reject(new Error(result.error));
                }
                resolve(result);
            } catch (err) {
                reject(new Error(`Failed to parse Python output: ${err.message}`));
            }
        });
    });
};
