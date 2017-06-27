FROM node:boron

ENV BASE_PATH=/usr/src/app

WORKDIR $BASE_PATH

VOLUME ["${BASE_PATH}/node_modules"]

ADD package.json $BASE_PATH
