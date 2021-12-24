FROM node:lts-gallium

ARG WORKDIR=/usr/local/src/

ADD package.json package-lock.json ${WORKDIR}

ADD client/package.json client/package-lock.json ${WORKDIR}

WORKDIR ${WORKDIR}

RUN make && make prestart


