import { diskStorage } from 'multer';
import { Request } from 'express';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export function multerConfig(folder: string) {
  return {
    storage: diskStorage({
      destination: `./uploads/${folder}`,
      filename(
        req: Request,
        file: Express.Multer.File,
        callback: (error: Error | null, filename: string) => void,
      ) {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        callback(null, uniqueName);
      },
    }),
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, accepted: boolean) => void,
    ) => {
      const allowedTypes = /jpeg|jpg|png|webp/;
      const isValid = allowedTypes.test(
        extname(file.originalname).toLowerCase(),
      );
      if (!isValid) {
        return cb(
          new BadRequestException('Only image files are allowed'),
          false,
        );
      }
      cb(null, true);
    },
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
  };
}
