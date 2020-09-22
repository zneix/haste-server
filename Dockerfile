FROM node:lts-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . . 

RUN npm run build

RUN npm install redis@0.8.1 && \
    npm install pg@4.1.1 && \
    npm install memcached@2.2.2 && \
    npm install aws-sdk@2.738.0 && \
    npm install rethinkdbdash@2.3.31

ENV HOST 0.0.0.0

EXPOSE 7777
STOPSIGNAL SIGINT
ENTRYPOINT [ "node", "server.js" ]

CMD ["npm", "start"]