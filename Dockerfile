FROM node:16-alpine
COPY dist dist
COPY entrypoint.sh entrypoint.sh
ENTRYPOINT [ "sh", "entrypoint.sh" ]