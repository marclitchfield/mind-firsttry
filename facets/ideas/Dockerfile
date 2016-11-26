FROM mhart/alpine-node:6

WORKDIR .
ADD . .

RUN npm install

RUN node_modules/.bin/webpack

ENV PORT 9010

ENTRYPOINT npm start
