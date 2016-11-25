FROM mhart/alpine-node:6

WORKDIR .
ADD . .

RUN npm install -g webpack
RUN npm install

RUN webpack

ENV PORT 9010

ENTRYPOINT npm run start
