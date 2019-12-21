FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

EXPOSE 3000

CMD [ "npm", "run", "dev:api" ]
