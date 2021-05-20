FROM node:lts-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . . 

RUN npm run build

ENV HOST 0.0.0.0

EXPOSE 7777
STOPSIGNAL SIGINT
ENTRYPOINT [ "node", "server.js" ]

CMD ["npm", "start"]