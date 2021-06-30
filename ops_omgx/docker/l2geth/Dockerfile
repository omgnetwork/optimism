ARG BUILD_IMAGE=""
ARG BUILD_IMAGE_VERSION=""

FROM ${BUILD_IMAGE}:${BUILD_IMAGE_VERSION} as builder

COPY secret2env /opt/secret2env
COPY wait-for-l1.sh /bin
RUN chmod +x /bin/wait-for-l1.sh && \
    chmod +x /opt/secret2env && \
    apk add --no-cache musl-dev 
EXPOSE 8545 8546
