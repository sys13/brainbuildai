#!/usr/bin/env bash

psql -d postgres -c "select pg_terminate_backend(pg_stat_activity.pid) from pg_stat_activity where pg_stat_activity.datname = 'brainbuildai' AND pid <> pg_backend_pid();"
psql -d postgres -c "DROP DATABASE brainbuildai;"
psql -d postgres -c "CREATE DATABASE brainbuildai;"
rm -rf ./drizzle/migrations/*
npx drizzle-kit generate
npm run db:gen:vectors
# npm run lint:fix
npm run db:migrate
npm run db:seed