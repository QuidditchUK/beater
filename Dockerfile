FROM node:17

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json ./

RUN yarn install

COPY . .

EXPOSE 4000

CMD [ "npm", "run", "dev:app" ]
