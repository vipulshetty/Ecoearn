FROM node:18-alpine

WORKDIR /app

# Install Python for AI models
RUN apk add --no-cache python3 py3-pip

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]