import { createConnection } from 'typeorm';
import * as EventSource from 'eventsource';
import { parse } from 'path';
import "reflect-metadata";

import { Encode } from '@src/entity/Encode';
import { ffmpeg, unlink, rename } from '@src/rpc';
import { FFMpegStatus, EncodeStatus } from '@src/models';
import { sleep } from '@src/utils';
import { RPC_SERVER_SSE } from '@src/config';
import { send } from '@src/sse';
import * as logger from '@src/utils/logger';

const STATUS_EVENT = 'status';
const FINISH_EVENT = 'finish';
const ERROR_EVENT = 'error';

async function main () {
  try {
    while (true) {
      const encode: Encode | undefined = await Encode.findOne({ progress: 0 });
      if (encode) {
        await encodeVideo(encode);
        return;
      }
      await sleep(1000);
    }
  } catch (err) {
    console.error(err);
  }
}

async function encodeVideo(encode: Encode) {
  const args: string[] = encode.options.split(' ');
  const inpath: string = encode.inpath;
  const outpath: string = (inpath === encode.outpath)
    ? `${parse(inpath).dir}/${parse(inpath).name}.tmp.mp4`
    : encode.outpath;

  const pid: number = await ffmpeg(inpath, outpath, args);
  logger.log(`START/${pid}`, inpath, outpath, ...args);

  const es = new EventSource(`${RPC_SERVER_SSE}/ffmpeg/${pid}`);
  
  es.addEventListener(STATUS_EVENT, (event) => {
    const status: FFMpegStatus = JSON.parse(event.data);
    const { progress, eta, speed } = status;
    
    const encodeStatus: EncodeStatus = {
      encodeId: encode.id,
      progress,
      eta,
      speed,
    }
    
    Encode.update(encode.id, { progress });
    send('/ffmpeg', encodeStatus);
  });
  
  es.addEventListener(FINISH_EVENT, (event) => {
    (async function () {
      es.close();
      if (encode.inpath === encode.outpath) {
        await unlink(inpath);
        await rename(outpath, inpath);
      }
      logger.log(`FINISH/${pid}`, inpath, outpath, ...args);
      main();
    })();
  });
  
  es.addEventListener(ERROR_EVENT, (event) => {
    logger.log(`ERROR/${pid}`, inpath, outpath, ...args);
    logger.log(`ERROR/${pid}`, event);
    console.error(ERROR_EVENT, event);
    Encode.update(encode.id, { progress: -1 });
    main();
  });
}

createConnection()
  .then(main);
