FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY .env.example ./

EXPOSE 4000

CMD ["node", "src/server.js"]
