import * as jayson from 'jayson';

import { RPC_SERVER_HOST, RPC_SERVER_PORT } from '@src/config';
import { FFProbeVideo } from '@src/models';

// TODO from config
const client = jayson.Client.http({
  host: RPC_SERVER_HOST,
  port: RPC_SERVER_PORT,
  timeout: 0,
});

function call(functionName, args): Promise<any> {
  return new Promise((resolve, reject) => {
    client.request(functionName, args, (err, error, response) => {
      if (err) {
        reject(err);
      } else if (error) {
        reject(new Error(error.message));
      } else {
        resolve(response);
      }
    });
  });
}

export async function ffmpeg(inpath: string, outpath: string, args: string[]): Promise<number> {
  return call('ffmpeg', { inpath, outpath, args });
}

export async function ffprobeVideo(path: string): Promise<FFProbeVideo> {
  return call('ffprobeVideo', { path });
}

export function rename(from: string, to: string): Promise<void> {
  return call('rename', { from, to });
}

export function unlink(path: string): Promise<void> {
  return call('unlink', { path });
}
