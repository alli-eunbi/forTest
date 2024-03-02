FROM node:21.6.2-alpine

COPY . /tmp
WORKDIR /tmp

RUN yarn

CMD [ "yarn", "start" ]