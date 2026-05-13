import { Injectable, OnModuleInit } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadsService implements OnModuleInit {
  /** Resolved at runtime so it works both in dev (cwd = monorepo root) and Docker (/app). */
  static uploadsDir(): string {
    const dir = process.env['UPLOADS_DIR'] ?? join(process.cwd(), 'uploads');
    return dir;
  }

  onModuleInit() {
    const dir = UploadsService.uploadsDir();
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`📁 Created uploads directory: ${dir}`);
    }
  }
}
