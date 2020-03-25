FROM node:12.16.1-alpine

WORKDIR /app

RUN apk add --no-cache tzdata
ENV TZ='Asia/Seoul'

COPY . /app

CMD npm start