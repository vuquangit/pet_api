<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install
```

## Migrations

```bash
# Create a migration
$ npm run migration:create --name=foo

# Generate a migration from schema changes
$ npm run migration:generate --name=pet

# Run migrations and checks for schema changes
$ npm run migration:run

# Revert migrations
$ npm run migration:revert
```

## Seed data

```bash
# Create a seed config
$ npm run seed:config

# Run seed data
$ npm run seed:run
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Docs api

```bash
# Swagger
$ http://localhost:8080/api/docs
```

## Deploy api

```bash
# Dev
$ git checkout develop
$ git pull
$ yarn build & vercel deploy 

# Staging
$ git checkout staging
$ git pull
$ yarn build & vercel deploy 

# Production
$ git checkout main
$ git pull
$ yarn build & vercel deploy --prod
```
