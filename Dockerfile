FROM node:10.16.3-alpine

RUN apk add --no-cache tzdata
ENV TZ='Asia/Seoul'

WORKDIR /app

COPY . /app

CMD npm start