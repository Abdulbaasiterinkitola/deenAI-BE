import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  ParseUUIDPipe,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { RecitersService } from './reciters.service';
import { CreateReciterDto } from './dtos/create-reciter.dto';
import { ReciterFilterDto } from './dtos/reciter-filter.dto';
import { SuperadminGuard } from '@guards/superadmin.guard';
import * as fs from 'fs';
import * as path from 'path';
import { Request, Response } from 'express';
import { RecitersDocs } from './docs/reciters.doc'; // <-- docs helper

const STORAGE_PATH =
  process.env.RECITER_AUDIO_STORAGE_PATH || 'uploads/reciters';
const MAX_SIZE = Number(process.env.RECITER_AUDIO_MAX_SIZE || 50 * 1024 * 1024);

fs.mkdirSync(STORAGE_PATH, { recursive: true });

@RecitersDocs.tag()
@Controller({ path: 'reciters', version: '1' })
export class RecitersController {
  constructor(
    private recitersService: RecitersService,
    private configService: ConfigService,
  ) {}

  @Get()
  @RecitersDocs.getAll()
  async list(@Query() query: ReciterFilterDto, @Req() req: Request) {
    const res = await this.recitersService.list(query);
    const host = req.protocol + '://' + req.get('host');
    const payload = (res.payload || []).map((r: any) => ({
      id: r.id,
      reciterName: r.reciterName,
      surah: r.surah,
      surahNumber: r.surahNumber,
      fileSize: Number(r.fileSize),
      duration: r.duration,
      downloadUrl: `${host}/api/v1/reciters/${r.id}/download`,
      createdAt: r.createdAt,
    }));
    return {
      success: true,
      message: 'Reciters fetched',
      data: payload,
      meta: res.paginationMeta,
    };
  }

  @Post('upload')
  @UseGuards(SuperadminGuard)
  @RecitersDocs.upload()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_, __, cb) => cb(null, STORAGE_PATH),
        filename: (_, file, cb) => {
          const ext = path.extname(file.originalname);
          const base = path
            .basename(file.originalname, ext)
            .replace(/\s+/g, '_')
            .toLowerCase();
          cb(null, `${Date.now()}-${base}${ext}`);
        },
      }),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_, file, cb) => {
        const allowed = ['audio/mpeg', 'audio/mp3'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowed.includes(file.mimetype) && ext !== '.mp3') {
          return cb(
            new HttpException(
              'Invalid file type. Only MP3 allowed',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateReciterDto,
    @Req() req: Request,
  ) {
    if (!file)
      throw new HttpException('MP3 file is required', HttpStatus.BAD_REQUEST);

    const created = await this.recitersService.createReciter({
      ...dto,
      filePath: file.filename,
      fileSize: file.size,
      duration: dto.duration,
    });

    const downloadUrl = `${req.protocol}://${req.get('host')}/api/v1/reciters/${created.id}/download`;

    return {
      success: true,
      message: 'Reciter uploaded',
      data: {
        id: created.id,
        reciterName: created.reciterName,
        surah: created.surah,
        surahNumber: created.surahNumber,
        fileSize: Number(created.fileSize),
        duration: created.duration,
        downloadUrl,
        createdAt: created.createdAt,
      },
    };
  }

  @Get(':id/download')
  @RecitersDocs.download()
  async download(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const reciter = await this.recitersService.getById(id);
    if (!reciter) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: 'Reciter not found' });
    }

    const storage =
      this.configService.get<string>('RECITER_AUDIO_STORAGE_PATH') ||
      STORAGE_PATH;
    const fileFullPath = path.isAbsolute(reciter.filePath)
      ? reciter.filePath
      : path.join(storage, reciter.filePath);

    if (!fs.existsSync(fileFullPath)) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: 'File not found' });
    }

    const stat = fs.statSync(fileFullPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const fileName = `${reciter.reciterName.replace(/\s+/g, '_').toLowerCase()}-${reciter.surah}.mp3`;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      if (isNaN(start) || isNaN(end) || start > end) {
        return res.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE).send();
      }
      const chunkSize = end - start + 1;
      const stream = fs.createReadStream(fileFullPath, { start, end });
      res.writeHead(HttpStatus.PARTIAL_CONTENT, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunkSize),
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `inline; filename="${fileName}"`,
      });
      stream.pipe(res);
    } else {
      const stream = fs.createReadStream(fileFullPath);
      res.writeHead(HttpStatus.OK, {
        'Content-Length': String(fileSize),
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });
      stream.pipe(res);
    }
  }
}
