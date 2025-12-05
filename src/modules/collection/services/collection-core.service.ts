import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import {
  CreateCollectionDto,
  UploadCollectionResponseDto,
} from '../dto/collection.dto';
import { CollectionsValidationService } from './collection-validator.service';
import { CollectionsCompressionService } from './collection-compression.service';
import { CollectionActionModel } from '../action-models/collection.action-model';
import { CompressionAlgorithm } from '../models/collection-model';

@Injectable()
export class CollectionsCoreService {
  private readonly logger = new Logger(CollectionsCoreService.name);
  private readonly uploadDir: string;

  constructor(
    private readonly validationService: CollectionsValidationService,
    private readonly compressionService: CollectionsCompressionService,
    private readonly collectionActionModel: CollectionActionModel,
    private readonly configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || 'uploads';
  }

  /**
   * Handles the upload, compression, and storage of multiple collection files
   */
  async uploadCollections(
    files: Array<Express.Multer.File>,
    dto: CreateCollectionDto,
  ): Promise<UploadCollectionResponseDto[]> {
    // Validate DTO and Files
    this.validationService.validateCreateCollectionDto(dto);
    this.validationService.validateFiles(files);

    const responses: UploadCollectionResponseDto[] = [];

    // Ensure base upload directory exists
    const baseDir = path.join(
      this.uploadDir,
      'collections',
      dto.type,
      dto.language,
      dto.version,
    );
    await fs.promises.mkdir(baseDir, { recursive: true });

    for (const file of files) {
      try {
        //  Prepare File Paths
        const timestamp = Date.now();
        const filename = file.originalname.replace(/[^a-z0-9.]/gi, '_');
        const originalFilename = `${timestamp}-${filename}`;
        const originalFilePath = path.join(baseDir, originalFilename);
        const compressedFilePath = `${originalFilePath}.gz`;

        // Save Original File
        await fs.promises.writeFile(originalFilePath, file.buffer);

        // Compress File
        const compressionResult = await this.compressionService.compressFile(
          originalFilePath,
          compressedFilePath,
          CompressionAlgorithm.gzip,
        );

        // Parse Metadata
        let metadata = {};
        if (dto.metadata) {
          metadata =
            typeof dto.metadata === 'string'
              ? JSON.parse(dto.metadata)
              : dto.metadata;
        }

        // Save to Database
        const collectionName =
          files.length > 1 ? `${dto.name} - ${file.originalname}` : dto.name;

        const collection = await this.collectionActionModel.create({
          createPayload: {
            type: dto.type,
            name: collectionName,
            description: dto.description,
            language: dto.language,
            version: dto.version,
            originalFilePath: originalFilePath,
            compressedFilePath: compressedFilePath,
            originalSize: compressionResult.originalSize,
            compressedSize: compressionResult.compressedSize,
            compressionRatio: compressionResult.compressionRatio,
            compressionAlgorithm: compressionResult.algorithm,
            metadata: {
              ...metadata,
              originalFilename: file.originalname,
              mimetype: file.mimetype,
            },
          },
        });

        if (!collection) {
          throw new InternalServerErrorException(
            'Failed to save collection record',
          );
        }

        responses.push({
          id: collection.id,
          name: collection.name,
          version: collection.version,
          originalSize: Number(collection.originalSize),
          compressedSize: Number(collection.compressedSize),
          compressionRatio: collection.compressionRatio,
          message: 'File uploaded and compressed successfully',
        });
      } catch (error) {
        this.logger.error(
          `Failed to process file ${file.originalname}: ${error.message}`,
          error.stack,
        );
        // If it's a duplicate key error (Postgres code 23505), throw a friendly error
        if (error.code === '23505') {
          throw new BadRequestException(
            `A collection with this type, language, and version already exists.`,
          );
        }
        throw new InternalServerErrorException(
          `Failed to process file ${file.originalname}: ${error.message}`,
        );
      }
    }

    return responses;
  }
}
