FROM node:lts-alpine

RUN apk add --no-cache curl

RUN mkdir -p /usr/src/app && \
    chown node:node /usr/src/app

USER node:node

WORKDIR /usr/src/app

COPY --chown=node:node . .

RUN npm run build

# uncomment dbms client packages here
#RUN npm install pg@8.5.1 && \
#    npm install aws-sdk@2.842.0 && \
#    npm install memcached@2.2.2 && \
#    npm install mongodb@3.6.4 && \
#    npm install ioredis@4.22.0 && \
#    npm install rethinkdbdash@2.3.31

ENV PORT=7777

EXPOSE ${PORT}
STOPSIGNAL SIGINT
ENTRYPOINT [ "node", "server.js" ]

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
    --retries=1 CMD curl -sS -o /dev/null localhost:${PORT} || exit 1

CMD [ "npm", "start" ]
