import { createServer, IncomingMessage, ServerResponse } from 'http';
import SSEStream from 'ssestream';
import { logger } from '@src/utils';

import { PORT } from '@src/config';

const streams = new Map<string, SSEStream[]>();

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const stream = new SSEStream(req);
  stream.pipe(res);

  const path: string = req.url;

  const arr: SSEStream[] = streams.get(path) || [];
  arr.push(stream);
  streams.set(path, arr);
  logger(`CONNECT${path}`, `Connected from ${req.socket.remoteAddress}`);

  req.socket.on('close', () => {
    const arr2: SSEStream[] = streams.get(path) || [];
    arr2.splice(arr2.indexOf(stream), 1);
    streams.set(path, arr2);
    logger(`DISCONNECT${path}`, `Disconnected from ${req.socket.remoteAddress}`);
  });
});

server.listen(PORT, () => {
  console.log(`*** SSE Server Started at ${PORT} !!!`);
});

export default function send(path: string, data: object | string) {
  logger(`SEND${path}`, data);
  const arr = streams.get(path) || [];
  arr.forEach((stream) => stream.write({ data }));
}
