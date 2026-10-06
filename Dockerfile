FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY src ./src
USER node
ENV PT_STATE_FILE=/home/node/.paperclip-telegram/state.json
CMD ["node", "src/index.mjs"]
