FROM golang:1.15.1

# VARIANT can be either 'hugo' for the standard version or 'hugo_extended' for the extended version.
ARG VARIANT=hugo
# VERSION can be either 'latest' or a specific version number
ARG VERSION=latest

# Download and patch selected Hugo binary
RUN apt-get update && apt-get install -y ca-certificates openssl git curl && \
    rm -rf /var/lib/apt/lists/* && \
    case ${VERSION} in \
    latest) \
    export VERSION=$(curl -s https://api.github.com/repos/gohugoio/hugo/releases/latest | grep "tag_name" | awk '{print substr($2, 3, length($2)-4)}') ;;\
    esac && \
    echo ${VERSION} && \
    wget -O ${VERSION}.tar.gz https://github.com/gohugoio/hugo/releases/download/v${VERSION}/${VARIANT}_${VERSION}_Linux-64bit.tar.gz && \
    tar xf ${VERSION}.tar.gz && \
    mv hugo* /usr/bin/hugo && \
    go get github.com/yaegashi/muslstack && \
    muslstack -s 0x800000 /usr/bin/hugo

# Copy patched hugo binary from build stage
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:14

COPY --from=0 /usr/bin/hugo /usr/bin

# Copy go binaries and set path
# (this is required to get hugo modules to work)
COPY --from=0 /usr/local/go/bin /usr/local/go/bin
ENV PATH="${PATH}:/usr/local/go/bin"

# Install Deno
ENV DENO_INSTALL=/deno
RUN mkdir -p /deno \
    && curl -fsSL https://deno.land/x/install/install.sh | sh \
    && chown -R node /deno

ENV PATH=${DENO_INSTALL}/bin:${PATH} \
    DENO_DIR=${DENO_INSTALL}/.cache/deno

EXPOSE 1313
