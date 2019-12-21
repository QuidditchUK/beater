#!/bin/bash

set -e

docker-compose -f docker-dev.yml down

docker-compose -f docker-dev.yml up -d postgres

echo "Waiting 5 seconds"
sleep 5

echo "Creating clean database"
docker-compose -f docker-dev.yml exec postgres \
  bash -c 'createdb -U docker quk_docker && psql -U docker quk_docker -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"'

echo "Building app"
docker-compose -f docker-dev.yml run app \
  sh -c 'npm run build'

echo "Running database migrations"
docker-compose -f docker-dev.yml run app \
  sh -c './node_modules/.bin/sequelize db:migrate --url ''postgresql://docker:docker@postgres:5432/quk_docker'''

docker-compose -f docker-dev.yml run app \
  sh -c './node_modules/.bin/sequelize db:seed:all --url ''postgresql://docker:docker@postgres:5432/quk_docker'''

docker-compose -f docker-dev.yml up --build

exit 0
