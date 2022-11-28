FROM node:19

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .
RUN yarn install

COPY public public
COPY src src

EXPOSE 3000

CMD [ "yarn", "start" ]
