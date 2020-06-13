#!/bin/bash

set -e

docker-compose -f docker-dev.yml down

docker-compose -f docker-dev.yml up -d postgres

echo "Building app"
docker-compose -f docker-dev.yml run app \
  sh -c 'npm run build'

echo "Running database migrations"
docker-compose -f docker-dev.yml run app \
  sh -c 'yarn run migrate up'

docker-compose -f docker-dev.yml up --build

exit 0
