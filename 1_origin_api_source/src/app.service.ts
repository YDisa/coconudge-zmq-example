import { Injectable } from '@nestjs/common';
import * as path from 'path'
import * as fs from 'fs'
import * as Randomstring from 'randomstring'

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

}
