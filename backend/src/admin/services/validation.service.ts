import crypto from 'crypto';
import fs from 'fs';
import { SupportedFileType } from '../types/admin.types';
import { ValidationError } from '../../shared/errors/app-error';

export class ValidationService {
  private allowedExtensions: SupportedFileType[] = [
    'PDF',
    'DOCX',
    'DOC',
    'TXT',
    'MD',
    'CSV',
    'XLSX',
    'PPTX',
    'JSON',
    'IMAGE',
    'ZIP',
    'HTML',
  ];

  public getExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()!.toUpperCase() : 'TXT';
  }

  public validateFile(file: Express.Multer.File, maxSizeBytes: number = 52428800): void {
    if (!file || !file.originalname) {
      throw new ValidationError('File upload payload is missing or invalid.');
    }

    if (file.size === 0) {
      throw new ValidationError(`File '${file.originalname}' is empty (0 bytes). Upload aborted.`);
    }

    if (file.size > maxSizeBytes) {
      const maxMb = (maxSizeBytes / 1024 / 1024).toFixed(0);
      throw new ValidationError(
        `File '${file.originalname}' size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed upload limit of ${maxMb} MB.`
      );
    }

    const ext = this.getExtension(file.originalname);
    const isValidExt = this.allowedExtensions.some((a) => a === ext || (ext === 'PNG' || ext === 'JPG' || ext === 'JPEG' ? a === 'IMAGE' : false));

    if (!isValidExt) {
      throw new ValidationError(
        `Unsupported file type '.${ext.toLowerCase()}'. Supported formats are: ${this.allowedExtensions.join(', ')}.`
      );
    }

    // Corrupted file validation check
    if (file.buffer || (file.path && fs.existsSync(file.path))) {
      const buffer = file.buffer || fs.readFileSync(file.path);

      if (ext === 'PDF') {
        const header = buffer.toString('utf-8', 0, 8);
        if (!header.startsWith('%PDF-')) {
          throw new ValidationError(
            `Corrupted file detected: File '${file.originalname}' claims to be PDF but lacks valid '%PDF-' header.`
          );
        }
      }

      if (ext === 'JSON') {
        try {
          JSON.parse(buffer.toString('utf-8'));
        } catch (err) {
          throw new ValidationError(
            `Corrupted file detected: File '${file.originalname}' contains invalid JSON syntax.`
          );
        }
      }
    }
  }

  public calculateHash(bufferOrPath: Buffer | string): string {
    const hash = crypto.createHash('sha256');
    if (typeof bufferOrPath === 'string') {
      const buffer = fs.readFileSync(bufferOrPath);
      hash.update(buffer);
    } else {
      hash.update(bufferOrPath);
    }
    return hash.digest('hex');
  }
}

export const validationService = new ValidationService();
