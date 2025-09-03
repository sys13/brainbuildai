#!/usr/bin/env bash

npx drizzle-kit generate
npm run db:gen:vectors
npm run lint:fix
npm run db:migrate
npm run db:seed