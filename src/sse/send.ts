import { createServer, IncomingMessage, ServerResponse } from 'http';
import SSEStream from 'ssestream';
import { logger } from '@src/utils';

import { PORT, SSE_PATH } from '@src/config';

const streams = new Map<IncomingMessage, SSEStream>();

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const stream = new SSEStream(req);
  stream.pipe(res);

  const path: string = req.url;

  streams.set(req, stream);
  logger(`connect${path}`, `Connected from ${req.socket.remoteAddress}`);

  req.socket.on('close', () => {
    streams.delete(req);
    logger(`disconnect${path}`, `Disconnected from ${req.socket.remoteAddress}`);
  });
});

server.listen(PORT, () => {
  console.log(`*** SSE Server Started at ${PORT} !!!`);
});

export default function send(data: object | string) {
  Array.from(streams.entries())
    .filter(([req, stream]) => req.url === SSE_PATH)
    .forEach(([req, stream]) => stream.write(data));
}
