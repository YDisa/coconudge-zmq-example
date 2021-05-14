import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import * as zmq from 'zeromq'

const ZME_HOST = "tcp://127.0.0.1:4000";

interface ZEROMQ_DATA {
  filePath:string
}

@Controller()
export class AppController {

  #sock:zmq.Pull = null;
  #pushSock: zmq.Push = null;

  constructor(private readonly appService: AppService) {
    this.#sock = new zmq.Pull;
    this.#pushSock = new zmq.Push;
    this.#sock.connect(ZME_HOST)
    console.log("Worker connected to port 4000")
    this.startSockListening();
    this.initPushSock();
  }

  private async startSockListening(){
    console.log("start Worker Listening");

    for await (const [msg] of this.#sock) {
      const data: ZEROMQ_DATA = JSON.parse(msg.toString());
      console.log(`resize start!! filePath : ${data.filePath}`);
      const resultData = await this.appService.imageResize(data.filePath)
      console.log(`resize end!! filePath : ${resultData.filePath} `);

    }
  }

  private async initPushSock() {
    await this.#pushSock.bind(ZME_HOST)
    console.log("Producer bound to port 4000")
  }


  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post("/upload")
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File){
    const returnData = await this.appService.upload(file);
    // await this.appService.imageResize(data.filePath)
    const pushData:ZEROMQ_DATA = {
      filePath : returnData.filePath
    }
    this.#pushSock.send(JSON.stringify(pushData));
    return returnData;
  }
}
