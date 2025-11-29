import { Injectable, HttpStatus } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuid } from 'uuid';
import { ProfileModelAction } from '../profile.model-action';
import { CustomHttpException } from '@shared/custom.exception';
import { ProfileValidationService } from './profile-validation.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProfileAvatarService {
  private baseStorage: string;
  private maxSize: number;
  private maxWidth: number;
  private maxHeight: number;

  constructor(
    private readonly profileModelAction: ProfileModelAction,
    private readonly profileValidationService: ProfileValidationService,
    private readonly configService: ConfigService,
  ) {
    this.baseStorage = this.configService.get<string>(
      'PROFILE_IMAGE_STORAGE_PATH',
    ) as string;
    this.maxSize = Number(
      this.configService.get<string>('PROFILE_IMAGE_MAX_SIZE'),
    );
    this.maxWidth = Number(
      this.configService.get<string>('PROFILE_IMAGE_MAX_WIDTH'),
    );
    this.maxHeight = Number(
      this.configService.get<string>('PROFILE_IMAGE_MAX_HEIGHT'),
    );
  }

  async ensureDirExists(dir: string) {
    await fs.mkdir(dir, { recursive: true });
  }

  generateFilename(originalName: string): string {
    const ext = path.extname(originalName);
    return `${uuid()}${ext}`;
  }

  async deleteFile(filePath: string) {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      // Ignore if file doesn’t exist
      console.warn(`Failed to delete file ${filePath}:`, err);
    }
  }

  async updateAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new CustomHttpException(
        'No file uploaded or file is empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.processAndSaveImage(userId, file.buffer, file.originalname, file.mimetype);
  }

  async updateAvatarFromBase64(
    userId: string,
    base64Data: string,
    filename: string,
  ): Promise<string> {
    // Remove data URL prefix if present (data:image/jpeg;base64,)
    const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    
    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64String, 'base64');
    } catch (error) {
      throw new CustomHttpException(
        'Invalid base64 data',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (buffer.length === 0) {
      throw new CustomHttpException(
        'Empty base64 data',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Detect MIME type from base64 data or use default
    const mimeType = this.detectMimeType(base64Data) || 'image/jpeg';
    
    return this.processAndSaveImage(userId, buffer, filename, mimeType);
  }

  private detectMimeType(base64Data: string): string | null {
    const mimeMatch = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    return mimeMatch ? mimeMatch[1] : null;
  }

  private async processAndSaveImage(
    userId: string,
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<string> {

    // Validate file size
    if (buffer.length > this.maxSize) {
      throw new CustomHttpException(
        'Image exceeds max allowed size',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Validate MIME type
    this.profileValidationService.validateMime(mimeType);

    // Validate image dimensions
    await this.profileValidationService.validateDimensions(
      buffer,
      this.maxWidth,
      this.maxHeight,
    );

    // Ensure storage directory exists
    if (!this.baseStorage) {
      throw new Error('PROFILE_IMAGE_STORAGE_PATH is not configured');
    }
    await this.ensureDirExists(this.baseStorage);

    // Generate unique filename
    const filename = this.generateFilename(originalName);
    const filePath = path.join(this.baseStorage, filename);

    // Save file to disk
    try {
      await fs.writeFile(filePath, buffer);
    } catch (err) {
      throw new CustomHttpException(
        `Failed to save uploaded file: ${err.message}`,
        500,
      );
    }

    // Fetch user profile
    const profile = await this.profileModelAction.get({ userId });
    if (!profile) {
      await this.deleteFile(filePath); // cleanup
      throw new CustomHttpException('Profile not found', HttpStatus.NOT_FOUND);
    }

    const oldAvatarUrl = profile.avatar || null;

    // Save only relative path for local uploads
    const avatarUrl = `/uploads/profiles/${filename}`;

    // Update profile in DB
    const updatedProfile = await this.profileModelAction.update({
      updatePayload: { avatar: avatarUrl },
      identifierOptions: { userId },
      transactionOptions: { useTransaction: false },
    });

    if (!updatedProfile) {
      await this.deleteFile(filePath); // cleanup
      throw new Error('Failed to update profile with new avatar');
    }

    // Delete old avatar from filesystem
    if (oldAvatarUrl) {
      const oldFilePath = path.join(
        this.baseStorage,
        path.basename(oldAvatarUrl),
      );
      await this.deleteFile(oldFilePath);
    }

    return avatarUrl; // return relative path
  }
}
