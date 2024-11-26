FROM node:lts-slim
USER node
WORKDIR /home/node/app
COPY --chown=node:node . .
RUN npm ci --omit=dev
# EXPOSE 1337
CMD [ "npm", "start" ]
