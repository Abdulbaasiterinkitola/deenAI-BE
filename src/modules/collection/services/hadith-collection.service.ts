import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import { Response } from 'express';
import { CollectionActionModel } from '../action-models/collection.action-model';
import { HadithQueryDto } from '../dto/hadithQuery.dto';
import { Collection, CollectionType } from '../models/collection-model';
import { FindOptionsWhere, ILike } from 'typeorm';

@Injectable()
export class HadithCollectionsService {
  constructor(private readonly collectionActionModel: CollectionActionModel) {}

  /**
   *  Filtering, search & pagination
   */
  async listCollections(query: HadithQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const filterRecordOptions: FindOptionsWhere<Collection> = {
      type: CollectionType.hadith,
    };

    if (query.search) {
      filterRecordOptions.name = ILike(`%${query.search}%`);
    }

    // Fetch items from model
    const items = await this.collectionActionModel.list({
      filterRecordOptions,
      paginationPayload: { page, limit },
      order: { createdAt: 'DESC' },
    });

    return {
      items,
    };
  }

  /**
   *  Get collection details
   */
  async getCollection(id: string): Promise<Collection> {
    const item = await this.collectionActionModel.get({ id });
    if (!item) throw new NotFoundException('Collection not found');
    return item;
  }

  /**
   *  Download file (supports range + content negotiation)
   */
  async downloadFile(id: string, compressed: boolean, res: Response) {
    const item = await this.getCollection(id);

    const filePath = compressed
      ? item.compressedFilePath
      : item.originalFilePath;

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const fileStat = fs.statSync(filePath);

    // ---- HTTP RANGE REQUEST SUPPORT ----
    const range = res.req.headers.range;
    let start = 0;
    let end = fileStat.size - 1;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : end;

      if (start >= fileStat.size) {
        res.status(416).send('Requested Range Not Satisfiable');
        return;
      }

      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${fileStat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': (end - start + 1).toString(),
      });
    } else {
      res.set({
        'Content-Length': fileStat.size.toString(),
        'Accept-Ranges': 'bytes',
      });
      res.status(200);
    }

    // ---- CONTENT NEGOTIATION ----
    if (compressed) {
      res.setHeader('Content-Type', 'application/gzip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${item.name}.gz"`,
      );
    } else {
      const mimetype =
        (item.metadata?.mimetype as string) || 'application/octet-stream';
      const originalFilename =
        (item.metadata?.originalFilename as string) || item.name;

      res.setHeader('Content-Type', mimetype);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${originalFilename}"`,
      );
    }

    const stream = fs.createReadStream(filePath, { start, end });
    stream.pipe(res);
  }
}
