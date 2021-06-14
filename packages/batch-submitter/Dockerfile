FROM node:14-buster as build
RUN apt-get update && apt-get install -y bash git python build-essential

ADD . /opt/batch-submitter
RUN cd /opt/batch-submitter && yarn install && yarn build

FROM node:14-buster

RUN apt-get update && apt-get install -y bash curl jq

COPY --from=build /opt/batch-submitter /opt/batch-submitter

COPY wait-for-l1-and-l2.sh /opt/
RUN chmod +x /opt/wait-for-l1-and-l2.sh

RUN ln -s /opt/batch-submitter/exec/run-batch-submitter.js /usr/local/bin/

ENTRYPOINT ["/opt/wait-for-l1-and-l2.sh", "run-batch-submitter.js"]