FROM node:lts-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

RUN npm run build

RUN rm -rf src

EXPOSE 3000
CMD [ "npm", "run", "prod" ]
