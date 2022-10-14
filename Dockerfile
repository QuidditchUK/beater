FROM node:18.11.0-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json ./

RUN yarn install

COPY . .

EXPOSE 4000

CMD [ "npm", "run", "dev:app" ]
