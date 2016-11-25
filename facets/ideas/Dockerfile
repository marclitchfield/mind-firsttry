FROM mhart/alpine-node:6

WORKDIR .
ADD . .

RUN npm install -g webpack
RUN npm install

RUN webpack -p

ENV PORT 3000

ENTRYPOINT npm run start
