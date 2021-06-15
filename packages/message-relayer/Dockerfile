FROM node:14-buster as base

RUN apt-get update && apt-get install -y bash curl jq

FROM base as build

RUN apt-get update && apt-get install -y bash git python build-essential

ADD . /opt/message-relayer
RUN cd /opt/message-relayer && yarn install && yarn build

FROM base

RUN apt-get update && apt-get install -y bash curl jq

COPY --from=build /opt/message-relayer /opt/message-relayer

COPY wait-for-l1-and-l2.sh /opt/
RUN chmod +x /opt/wait-for-l1-and-l2.sh

RUN ln -s /opt/message-relayer/exec/run-message-relayer.js /usr/local/bin/
RUN chmod +x /opt/message-relayer/exec/run-message-relayer.js

ENTRYPOINT ["/opt/wait-for-l1-and-l2.sh", "run-message-relayer.js"]