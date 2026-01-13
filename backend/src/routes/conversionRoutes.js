import express from 'express';
import multer from 'multer';
import { convertPdf } from '../controllers/conversionController.js';
import unifiedAuth from '../middlewares/unifiedAuth.js';
import { enforceLimits } from '../middlewares/limitMiddleware.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post('/', unifiedAuth, enforceLimits, upload.single('file'), convertPdf);

export default router;
