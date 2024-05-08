FROM node:20-alpine

ENV PORT=${PORT:-3000}

WORKDIR /app

COPY package*.json .

RUN npm install --verbose

COPY . .

EXPOSE 3000

CMD ["npm", "start"]