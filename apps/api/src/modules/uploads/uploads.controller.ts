import {
  Controller, Post, UploadedFile, UseInterceptors,
  BadRequestException, Get, Param, Res, NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, createReadStream } from 'fs';
import { UploadsService } from './uploads.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, UploadsService.uploadsDir());
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|mp3|mp4|ogg|wav|m4a|txt|csv)$/i;
        if (!allowed.test(file.originalname)) {
          return cb(new BadRequestException(`File type not allowed: ${file.originalname}`), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return {
      url: `/api/uploads/files/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Public()
  @Get('files/:filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    // Prevent path traversal
    if (filename.includes('..') || filename.includes('/')) {
      throw new BadRequestException('Invalid filename');
    }
    const filePath = join(UploadsService.uploadsDir(), filename);
    if (!existsSync(filePath)) throw new NotFoundException('File not found');
    createReadStream(filePath).pipe(res);
  }
}
