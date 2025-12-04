import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateCollectionDto } from '../dto/collection.dto';
import * as path from 'path';

@Injectable()
export class CollectionsValidationService {
  private readonly allowedMimeTypes = [
    'application/json',
    'application/xml',
    'text/xml',
    'text/plain', // Sometimes JSON/XML is uploaded as text/plain
  ];

  private readonly allowedExtention = ['.json', '.xml'];

  // Max file size (e.g., 50MB)
  private readonly maxFileSize = 50 * 1024 * 1024;

  /**
   * Validates the uploaded files
   */
  validateFiles(files: Array<Express.Multer.File>): void {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    for (const file of files) {
      // Validate Size
      if (file.size > this.maxFileSize) {
        throw new BadRequestException(
          `File ${file.originalname} exceeds the limit of ${this.maxFileSize / (1024 * 1024)}MB`,
        );
      }

      // Validate Extension
      const ext = path.extname(file.originalname).toLowerCase();
      if (!this.allowedExtention.includes(ext)) {
        throw new BadRequestException(
          `File ${file.originalname} has invalid extension. Allowed: ${this.allowedExtention.join(', ')}`,
        );
      }

      // Validate MIME Type
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `File ${file.originalname} has invalid type: ${file.mimetype}. Allowed: JSON, XML`,
        );
      }
    }
  }

  /**
   * Validates the DTO and business logic constraints
   */
  validateCreateCollectionDto(dto: CreateCollectionDto): void {
    // Validate Version Format (Semantic Versioning-ish)
    // Simple regex for x.y.z or x.y
    const versionRegex = /^\d+(\.\d+)*$/;
    if (!versionRegex.test(dto.version)) {
      throw new BadRequestException(
        'Invalid version format. Use format like 1.0 or 1.0.0',
      );
    }

    // Validate Language Code (ISO 2-letter)
    if (dto.language.length !== 2) {
      throw new BadRequestException(
        'Invalid language code. Use 2-letter ISO code (e.g., en, ar)',
      );
    }

    // Validate Metadata JSON if provided as string
    if (dto.metadata && typeof dto.metadata === 'string') {
      try {
        JSON.parse(dto.metadata);
      } catch {
        throw new BadRequestException('Invalid metadata JSON format');
      }
    }
  }
}
