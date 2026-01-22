import { processPdf } from '../services/pdfService.js';
import UsageLog from '../models/UsageLog.js';

export const convertPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const format = req.body.format || 'json';
        const mode = req.body.mode || 'tables';
        const allowedFormats = ['json', 'csv', 'excel', 'text'];
        if (!allowedFormats.includes(format)) {
            return res.status(400).json({ error: 'Invalid format. Allowed: ' + allowedFormats.join(', ') });
        }

        // Call Service
        const result = await processPdf(req.file.buffer, format, mode);

        // Log Usage
        await UsageLog.create({
            userId: req.user._id,
            apiKeyId: req.apiKey ? req.apiKey._id : null,
            endpoint: 'convert',
            status: 'SUCCESS',
            meta: {
                fileSize: req.file.size,
                format: format,
                mode: mode,
                fileName: req.file.originalname
            }
        });

        if (req.apiKey) {
            req.apiKey.usageCount = (req.apiKey.usageCount || 0) + 1;
            await req.apiKey.save();
        }

        // Send Response
        res.setHeader('Content-Type', result.content_type);
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);

        if (result.is_base64) {
            const fileBuffer = Buffer.from(result.file_content, 'base64');
            res.send(fileBuffer);
        } else {
            res.send(result.file_content);
        }

    } catch (error) {
        console.error('Conversion Controller Error:', error.message);

        if (error.message.includes('No tables found')) {
            return res.status(422).json({ error: error.message });
        }

        res.status(500).json({ error: error.message || 'Conversion failed' });
    }
};
