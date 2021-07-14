ARG BUILD_IMAGE=""
ARG BUILD_IMAGE_VERSION=""

FROM ${BUILD_IMAGE}:${BUILD_IMAGE_VERSION} as builder
USER root
COPY secret2env /opt/secret2env
COPY vault.sh /vault/vault.sh
RUN chmod +x /vault/vault.sh && \
    chmod +x /opt/secret2env && \
    apk add --no-cache musl-dev
EXPOSE 8201 8200
