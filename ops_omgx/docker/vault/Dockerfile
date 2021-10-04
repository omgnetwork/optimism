FROM golang:1.14-alpine AS builder
RUN apk add --no-cache gcc musl-dev git make
WORKDIR /src/
COPY . /src/

RUN	 go get github.com/jetstack/vault-unsealer && \
     make -C $(go env GOPATH)/src/github.com/jetstack/vault-unsealer build


FROM alpine:latest

RUN apk add --update ca-certificates musl-dev

COPY  --from=builder /go/src/github.com/jetstack/vault-unsealer/vault-unsealer_linux_amd64 /usr/local/bin/vault-unsealer

ENTRYPOINT ["/usr/local/bin/vault-unsealer"]
