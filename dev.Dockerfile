FROM node:alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 4000

CMD [ "npm", "run", "dev:api" ]
