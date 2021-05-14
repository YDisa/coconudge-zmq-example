import { Injectable } from '@nestjs/common';
import * as path from 'path'
import * as fs from 'fs'
import * as Randomstring from 'randomstring'
import * as sharp from 'sharp'


@Injectable()
export class AppService {

  #uploadDir = "upload";
  constructor() {
    this.checkDir(this.#uploadDir);
  }

  getHello(): string {
    return 'Hello World!';
  }

  async checkDir(path: string) {
    if (!fs.existsSync(path)) {
      await fs.mkdirSync(path)
    }
  }

  async upload(file: Express.Multer.File) {
    const fileName = Randomstring.generate() + file.originalname;
    await fs.writeFileSync(path.join(this.#uploadDir, fileName), file.buffer);
    return {
      filePath: path.join(this.#uploadDir, fileName),
      fileName: fileName
    }
  }

  async imageResize(filePath: string) {
    const fileName = "resize-" + Randomstring.generate() + ".png";
    const fileBuffer = fs.readFileSync(filePath);
    sharp(fileBuffer)
      .resize(120, 120)
      .png()
      .toFile(path.join(this.#uploadDir, fileName))
    await this.sleep(10000);
    return {
      filePath: path.join(this.#uploadDir, fileName)
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
