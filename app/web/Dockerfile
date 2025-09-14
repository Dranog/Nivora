FROM node:20-alpine
WORKDIR /app

# Dépendances
COPY package*.json ./
RUN npm ci || npm install

# Code (node_modules / .next exclus via .dockerignore)
COPY . .

# Hot reload Windows
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

EXPOSE 3000
# Next doit écouter sur 0.0.0.0 dans un conteneur
CMD ["npm","run","dev","--","-H","0.0.0.0","-p","3000"]

