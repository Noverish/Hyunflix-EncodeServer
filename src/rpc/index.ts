import * as jayson from 'jayson';

import { RPC_SERVER_HOST, RPC_SERVER_PORT } from '@src/config';

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
  return await call('ffmpeg', { inpath, outpath, args });
}

export function rename(from: string, to: string): Promise<void> {
  return call('rename', { from, to });
}

export function unlink(path: string): Promise<void> {
  return call('unlink', { path });
}