# 🤾🔴 Beater

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)

Beater is a QuidditchUK Backend application built in Node.js and Express.

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its [terms](CODE_OF_CONDUCT.md).

---

## QuickStart Local Development

The following guide spins up a local environment for development, with an up-to-date Postgres database seeded with dummy data running in the background. Each step must be completed before moving on to the next one.

### Prequisites

This project assumes you already have a Node evironment setup and have yarn installed. We strongly recommend using a Node Version Manager like [nvm](https://github.com/nvm-sh/nvm). You will also need to have [Docker Desktop](https://www.docker.com/get-started)

You will need a `.env` file to set environment variables - duplicate `.env.example` and rename the copy to `.env` to get started!

### Steps

1. Start Docker Desktop - this can take a few minutes
2. In your terminal go in to the beater folder (where this file is) and run `yarn install`
3. In the same folder run `yarn db:setup` which will start the docker container with Postgres, run migrations and seed the database
4. Finally run `yarn dev` in the same folder. This will start a separate docker container with the express application inside

Open [http://localhost:3333/health](http://localhost:3333/health) with your browser to see the application.

To tear down the database run `yarn docker:down`. To reinitialise simply run steps 3 & 4 again.

---

## OIDC

A big part of this API concerns our OpenID Connect Provider implementation, it is strongly advised you steer clear of this unless you know what you are doing + chat with the Technology Officer before embarking on making changes.

## Deployment

Deployment is controlled by the QuidditchUK Tech Staff on to our Heroku app. New environment variables must be added by the QuidditchUK Tech Staff.

## Known Limitations

### Stripe Functionality

Out of the box, if using this application locally with Chaser you will not be able to use any of the Stripe-related functionality due to needing a. access to our secret test keys and b. to set up a webhook listener to forward the test events to your own endpoints. There is a guide for doing the latter here: [https://stripe.com/docs/webhooks/test](https://stripe.com/docs/webhooks/test) and contact the Technology Officer for the private test keys.

## Key Technology and Documentation

- [Express](https://expressjs.com/)
- [Stripe](https://stripe.com/docs)
- [Prisma](https://www.prisma.io/docs/getting-started)
