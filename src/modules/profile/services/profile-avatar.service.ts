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

    // Validate file size
    if (file.size > this.maxSize) {
      throw new CustomHttpException(
        'Image exceeds max allowed size',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Validate MIME type
    this.profileValidationService.validateMime(file.mimetype);

    // Validate image dimensions
    await this.profileValidationService.validateDimensions(
      file.buffer,
      this.maxWidth,
      this.maxHeight,
    );

    // Ensure storage directory exists
    if (!this.baseStorage) {
      throw new Error('PROFILE_IMAGE_STORAGE_PATH is not configured');
    }
    await this.ensureDirExists(this.baseStorage);

    // Generate unique filename
    const filename = this.generateFilename(file.originalname);
    const filePath = path.join(this.baseStorage, filename);

    // Save file to disk
    try {
      await fs.writeFile(filePath, file.buffer);
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

    // Construct full URL for database
    const serverUrl = this.configService.get<string>('SERVER_URL') || '';
    const avatarUrl = `${serverUrl}/uploads/profiles/${filename}`;

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

    return avatarUrl; // return full URL
  }
}
