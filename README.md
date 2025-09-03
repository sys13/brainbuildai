# brainbuildai

[![🚀 Deploy](https://github.com/sys13/brainbuildai/actions/workflows/deploy.yml/badge.svg)](https://github.com/sys13/brainbuildai/actions/workflows/deploy.yml)

## How to get setup

1. nvm install v22
1. npm install
1. install vscode extensions
1. install postgres locally
1. npm run db:reseed
1. npm run dev
1. before committing: npm run validate

## Create new migration

1. `npx drizzle-kit generate`
1. `npm run db:migrate` or if you want to apply the migration regardless of
   errors `npx drizzle-kit push`

## Reset the db entirely locally

If prod:

1. Ensure `.env` is pointing to prod db
1. In one shell: `npm run db:proxy`
1. In pgadmin4, force delete the db
1. `psql -U postgres -h 127.0.0.1 -p 15432 -d postgres -c "CREATE DATABASE brainbuildai;"`

If dev:

```sh
psql -d postgres -c "select pg_terminate_backend(pg_stat_activity.pid) from pg_stat_activity where pg_stat_activity.datname = 'brainbuildai' AND pid <> pg_backend_pid();"
psql -d postgres -c "DROP DATABASE brainbuildai;"
psql -d postgres -c "CREATE DATABASE brainbuildai;"
```

```sh
//rm -rf ./drizzle/migrations/*
npm run db:gen:relations
npx drizzle-kit generate
npm run db:gen:vectors
npm run db:migrate
npm run db:seed
```

## Pick fields for a drizzle select

```js
pick(getTableColumns(user), ['id', 'tenantId'])
```

## Open pgAdmin 4

- install with brew
- create a connection with your computer username and blank password

## Connect to prod postgres

- `npm run db:proxy`
- `psql postgres://postgres:<password>@localhost:15432`

or without the fly proxy

- `psql "sslmode=require host=brainbuildai-db.fly.dev dbname=brainbuildai user=postgres"`

## Setup and Deploy

### Deploy

```sh
fly postgres create --name my-app-db
fly postgres attach --postgres-app my-app-db --app my-app
```

- follow <https://fly.io/docs/postgres/connecting/connecting-external/>

- `npm run db:proxy`
- connect to prod postgres locally
- change .env to connect to the prod db (filling in password):

```sh
DATABASE_URL="postgres://postgres:<password>@localhost:15432"
# DATABASE_URL="postgres://da@0.0.0.0:5432/brainbuildai"
```

- `psql postgres://postgres:<password>@localhost:15432`
- `CREATE DATABASE brainbuildai;`
- add `DATABASE_URL` to github secrets

## Seed in prod

- connect to prod locally with proxy
- change `.env` to connect to prod
- `npm run db:seed`

## Add more icons

`npx sly add`

- <https://lucide.dev/icons/>
- <https://www.radix-ui.com/icons>

## Add a new model

1. add the name, model, and relations to `models.ts`
1. add a new file to `./db/schema/` with the model schema
1. reference the new file in `db.server.ts`
1. add it to `generateRelations.ts`
1. run `npm run db:gen:relations`
1. add a field to `permission.ts`
1. add it to `authorization.server.ts`
1. check `generatedRelations.ts` for errors
1. run `npm run db:migrate`
1. add seed file and import it in `seed.ts`
1. add route files

## Add more components

1. add a new file to `./utils/pages/schemas/components`
1. add to `./utils/pages/schemas/components/ElementComponent.tsx`
1. add to `./utils/pages/page-elements-schema.ts`
