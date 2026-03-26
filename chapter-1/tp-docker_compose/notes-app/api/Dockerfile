FROM node:20-alpine

WORKDIR /app

# Copier d'abord les fichiers de dépendances pour profiter du cache Docker
COPY package*.json ./

RUN npm ci --only=production

# Copier ensuite le code source
COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
