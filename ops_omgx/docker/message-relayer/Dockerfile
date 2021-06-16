ARG BUILD_IMAGE=""
ARG BUILD_IMAGE_VERSION=""

FROM ${BUILD_IMAGE}:${BUILD_IMAGE_VERSION} as builder

COPY secret2env /opt/secret2env
COPY wait-for-l1-and-l2.sh /opt/
COPY relayer.sh /opt/message-relayer/relayer.sh
RUN chmod +x /opt/wait-for-l1-and-l2.sh && \
    chmod +x /opt/message-relayer/relayer.sh && \
    chmod +x /opt/message-relayer/exec/run-message-relayer.js && \
    chmod +x /opt/secret2env && \
    #apt update && \
    #apt install -y musl musl-dev musl-tools && \
    echo done
