// src/middleware/upload.ts
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';
import { BadRequestError } from '@/utils/AppError';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads', 'clients');

// Ensure the upload directory exists at startup.
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 40);
    cb(null, `${Date.now()}-${randomUUID().slice(0, 8)}-${safeBase}${ext}`);
  },
});

const ALLOWED = new Set([
  'application/pdf',
  'image/png', 'image/jpeg', 'image/jpg', 'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export const uploadClientFile = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) cb(null, true);
    else cb(new BadRequestError('Unsupported file type. Allowed: PDF, images, Word, Excel.'));
  },
}).single('file');


export const fileUrlFor = (filename: string): string => `/uploads/clients/${filename}`;