import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  async deleteImage(filePath: string | null | undefined): Promise<void> {
    if (!filePath) return;

    try {
      const fullPath = join(process.cwd(), filePath);
      await fs.promises.access(fullPath);
      await fs.promises.unlink(fullPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.error(`Failed to delete file: ${filePath}`, error);
      }
    }
  }

  getImagePath(folder: string, filename: string): string {
    return `/uploads/${folder}/${filename}`;
  }
}
