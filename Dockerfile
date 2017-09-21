FROM node:8.5.0-slim

WORKDIR /usr/src/app

COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 80

CMD ["npm", "start"]
