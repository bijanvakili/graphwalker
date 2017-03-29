FROM node:argon

ENV BASE_PATH=/usr/src/app

WORKDIR $BASE_PATH

VOLUME ["${BASE_PATH}/node_modules"]

ADD package.json $BASE_PATH

RUN npm config set loglevel error
