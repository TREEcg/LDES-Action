FROM node:16-alpine

COPY dist /dist
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]
