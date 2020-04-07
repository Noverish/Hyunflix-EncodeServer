import * as EventSource from 'eventsource';

import { ffmpeg, unlink, rename, ffprobeVideo } from '@src/rpc';
import { getFirstQueuedEncode, updateEncode, updateEncodeBefore, updateEncodeAfter } from '@src/api';
import { FFMpegStatus, EncodeStatus, EncodeDTO } from '@src/models';
import { logger } from '@src/utils';
import { RPC_SERVER_SSE, STATUS_EVENT, FINISH_EVENT, ERROR_EVENT } from '@src/config';
import send from '@src/sse/send';

async function encodeVideo(encode: EncodeDTO, callback: (success: boolean) => void): Promise<void> {
  const args: string[] = encode.options.split(' ');
  const { inpath, outpath } = encode;
  const realOutpath: string = (inpath === outpath)
    ? outpath.replace(/.mp4$/, '.tmp.mp4')
    : outpath;

  const pid: number = await ffmpeg(inpath, realOutpath, args);
  logger('pid', pid);

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

    logger('status', encodeStatus);
    updateEncode(encode.id, { progress });
    send(encodeStatus);
  });

  es.addEventListener(FINISH_EVENT, async (event) => {
    logger('finish');
    es.close();
    if (inpath === outpath) {
      await unlink(inpath);
      await rename(realOutpath, outpath);
    }

    updateEncode(encode.id, { progress: 100 });
    callback(true);
  });

  es.addEventListener(ERROR_EVENT, (event) => {
    logger('error', JSON.stringify(event));
    callback(false);
  });
}

function encodeVideoPromise(encode: EncodeDTO) {
  return new Promise((resolve, reject) => {
    encodeVideo(encode, resolve);
  });
}

async function main() {
  const encode: EncodeDTO | undefined = await getFirstQueuedEncode();
  if (encode) {
    logger('inpath', encode.inpath);
    logger('outpath', encode.outpath);
    logger('options', encode.options);

    const beforeProbed = await ffprobeVideo(encode.inpath);
    logger('beforeProbed', JSON.stringify(beforeProbed));
    await updateEncodeBefore(encode.id, beforeProbed);

    const success = await encodeVideoPromise(encode);

    if (success) {
      const afterProbed = await ffprobeVideo(encode.outpath);
      logger('afterProbed', JSON.stringify(afterProbed));
      await updateEncodeAfter(encode.id, afterProbed);
    }
  }
}

function mainWrapper() {
  main()
    .catch(console.error)
    .then(() => {
      setTimeout(mainWrapper, 1000);
    });
}

mainWrapper();
