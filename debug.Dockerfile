FROM node:alpine

WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# default to docker
ARG NODE=docker
ENV NODE_ENV ${NODE}

EXPOSE 3000

CMD [ "npm", "run", "dev:debug" ]