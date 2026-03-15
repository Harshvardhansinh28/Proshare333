/// <reference types="multer" />
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  private readonly uploadPath = join(__dirname, '..', '..', 'public', 'uploads');

  constructor() {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = join(this.uploadPath, fileName);

    writeFileSync(filePath, file.buffer);

    return `/public/uploads/${fileName}`;
  }
}
