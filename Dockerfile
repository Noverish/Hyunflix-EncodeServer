FROM node:10.16.3-alpine

RUN apk add --no-cache tzdata
ENV TZ='Asia/Seoul'

WORKDIR /app

COPY node_modules  /app/node_modules
COPY src           /app/src
COPY ormconfig.js  /app
COPY package.json  /app
COPY tsconfig.json /app

CMD ["npm", "start"]