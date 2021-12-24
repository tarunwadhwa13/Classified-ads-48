FROM node:lts-gallium

ARG WORKDIR=/usr/local/src/

WORKDIR ${WORKDIR}

RUN npm install -g webpack webpack-cli

ADD . .

RUN make && make prestart

CMD ["npm", "run", "start"]
