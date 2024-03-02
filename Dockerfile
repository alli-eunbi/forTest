FROM node:21.6.2-alpine

COPY . /
WORKDIR /

RUN yarn

CMD [ "yarn", "start" ]