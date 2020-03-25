import { createConnection } from 'typeorm';
import * as EventSource from 'eventsource';
import { parse } from 'path';
import 'reflect-metadata';

import { Encode, Video } from '@src/entity';
import {
  ffmpeg, unlink, rename, ffprobeVideo,
} from '@src/rpc';
import { FFMpegStatus, EncodeStatus } from '@src/models';
import { logger } from '@src/utils';
import { RPC_SERVER_SSE } from '@src/config';
import send from '@src/sse/send';

const STATUS_EVENT = 'status';
const FINISH_EVENT = 'finish';
const ERROR_EVENT = 'error';

async function main() {
  const encode: Encode | null = await Encode.findOne({ progress: 0 });
  if (encode) {
    try {
      await encodeVideoPromise(encode);
    } catch (err) {
      console.error(err);
      await Encode.update(encode.id, { progress: -1 });
    }
  }
  setTimeout(main, 1000);
}

function encodeVideoPromise(encode: Encode): Promise<void> {
  return new Promise((resolve, reject) => {
    encodeVideo(encode, () => {
      resolve();
    })
  })
}

async function encodeVideo(encode: Encode, callback: () => void): Promise<void> {
  const args: string[] = encode.options.split(' ');
  const { inpath } = encode;
  const outpath: string = (inpath === encode.outpath)
    ? `${parse(inpath).dir}/${parse(inpath).name}.tmp.mp4`
    : encode.outpath;

  const pid: number = await ffmpeg(inpath, outpath, args);
  logger(`START/${pid}`, inpath, outpath, ...args);

  const es = new EventSource(`${RPC_SERVER_SSE}/ffmpeg/${pid}`);

  es.addEventListener(STATUS_EVENT, (event) => {
    const status: FFMpegStatus = JSON.parse(event.data);
    const { progress, eta, speed } = status;

    const encodeStatus: EncodeStatus = {
      encodeId: encode.id,
      progress,
      eta,
      speed,
    };

    Encode.update(encode.id, { progress });
    send('/ffmpeg', encodeStatus);
  });

  es.addEventListener(FINISH_EVENT, async (event) => {
    es.close();
    if (encode.inpath === encode.outpath) {
      await unlink(inpath);
      await rename(outpath, inpath);
    }

    const video = await Video.findOne({ path: encode.outpath });
    if (video) {
      const probed = await ffprobeVideo(encode.outpath);
      video.duration = probed.duration;
      video.width = probed.width;
      video.height = probed.height;
      video.bitrate = probed.bitrate;
      video.size = probed.size.toString();
      video.save();
    }

    logger(`FINISH/${pid}`, inpath, encode.outpath, ...args);
    callback();
  });

  es.addEventListener(ERROR_EVENT, (event) => {
    logger(`ERROR/${pid}`, inpath, encode.outpath, ...args);
    logger(`ERROR/${pid}`, event);
    console.error(ERROR_EVENT, event);
    Encode.update(encode.id, { progress: -1 });
    callback();
  });
}

createConnection()
  .then(main);
