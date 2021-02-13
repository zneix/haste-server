FROM node:lts-alpine

RUN apk add --no-cache curl

RUN mkdir -p /usr/src/app && \
    chown node:node /usr/src/app

USER node:node

WORKDIR /usr/src/app

COPY --chown=node:node . .

# Replace build with build-min to exclude the optional dbms dependencies
# and uncomment the needed one below to build a smaller Docker image.
RUN npm run build
#RUN npm install pg
#RUN npm install aws-sdk
#RUN npm install memcached
#RUN npm install mongodb
#RUN npm install ioredis
#RUN npm install rethinkdbdash

ENV PORT=7777

EXPOSE ${PORT}
STOPSIGNAL SIGINT
ENTRYPOINT [ "node", "server.js" ]

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
    --retries=1 CMD curl -sS -o /dev/null localhost:${PORT} || exit 1

CMD [ "npm", "start" ]
