import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as zlib from 'zlib';
import { pipeline } from 'stream/promises';
import { CompressionAlgorithm } from '../model/collection-model';

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  algorithm: CompressionAlgorithm;
  outputPath: string;
}

@Injectable()
export class CollectionsCompressionService {
  private readonly logger = new Logger(CollectionsCompressionService.name);

  /**
   * Compresses a file using the specified algorithm (default: gzip)
   * Uses streams to handle large files efficiently without loading them into memory.
   */
  async compressFile(
    inputPath: string,
    outputPath: string,
    algorithm: CompressionAlgorithm = CompressionAlgorithm.gzip,
  ): Promise<CompressionResult> {
    this.logger.log(
      `Starting compression for ${inputPath} using ${algorithm}...`,
    );

    try {
      const source = fs.createReadStream(inputPath);
      const destination = fs.createWriteStream(outputPath);
      let compressor: any;

      switch (algorithm) {
        case CompressionAlgorithm.gzip:
          compressor = zlib.createGzip();
          break;
        case CompressionAlgorithm.brotli:
          compressor = zlib.createBrotliCompress();
          break;
        case CompressionAlgorithm.deflate:
          compressor = zlib.createDeflate();
          break;
        default:
          compressor = zlib.createGzip(); // Default fallback
      }

      // Pipeline for proper error handling and cleanup
      await pipeline(source, compressor, destination);

      // Get file stats
      const originalStats = await fs.promises.stat(inputPath);
      const compressedStats = await fs.promises.stat(outputPath);

      const ratio = this.getCompressionRatio(
        originalStats.size,
        compressedStats.size,
      );

      this.logger.log(
        `Compression complete. Ratio: ${ratio.toFixed(2)}% (Original: ${originalStats.size}B -> Compressed: ${compressedStats.size}B)`,
      );

      return {
        originalSize: originalStats.size,
        compressedSize: compressedStats.size,
        compressionRatio: ratio,
        algorithm,
        outputPath,
      };
    } catch (error) {
      this.logger.error(
        `Compression failed for ${inputPath}: ${error.message}`,
        error.stack,
      );
      // Clean up partial file if it exists
      if (fs.existsSync(outputPath)) {
        await fs.promises.unlink(outputPath).catch(() => {});
      }
      throw error;
    }
  }

  /**
   * Decompressing a file for verification or reading content
   */
  async decompressFile(
    inputPath: string,
    outputPath: string,
    algorithm: CompressionAlgorithm = CompressionAlgorithm.gzip,
  ): Promise<void> {
    const source = fs.createReadStream(inputPath);
    const destination = fs.createWriteStream(outputPath);
    let decompressor: any;

    switch (algorithm) {
      case CompressionAlgorithm.gzip:
        decompressor = zlib.createGunzip();
        break;
      case CompressionAlgorithm.brotli:
        decompressor = zlib.createBrotliDecompress();
        break;
      case CompressionAlgorithm.deflate:
        decompressor = zlib.createInflate();
        break;
      default:
        decompressor = zlib.createGunzip();
    }

    await pipeline(source, decompressor, destination);
  }

  /**
   * Calculates compression ratio as a percentage of space saved.
   * Example: 100B -> 40B = 60% saved.
   */
  getCompressionRatio(originalSize: number, compressedSize: number): number {
    if (originalSize === 0) return 0;
    return ((originalSize - compressedSize) / originalSize) * 100;
  }
}
