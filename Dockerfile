# This file is moved to the root directory before building the image

# base node image
FROM node:22-bookworm-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl
RUN apt-get update && apt-get install -y fuse3 openssl ca-certificates

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /myapp

ADD package.json package-lock.json .npmrc ./
RUN npm ci --include=dev

RUN npx playwright install --with-deps chromium

# Setup production node_modules
FROM base as production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD package.json package-lock.json .npmrc ./
RUN npm prune --omit=dev

# Build the app
FROM base as build

ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA

# Use the following environment variables to configure Sentry
# ENV SENTRY_ORG=
# ENV SENTRY_PROJECT=

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD . .
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
  export SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) && \
  npm run build

# Finally, build the production image with minimal footprint
FROM base

RUN apt-get update && apt-get install -y \
  fuse3 openssl ca-certificates \
  libglib2.0-0 \
  libnss3 \
  libatk-bridge2.0-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libatk1.0-0 \
  libpangocairo-1.0-0 \
  libpango-1.0-0 \
  libcups2 \
  libxss1 \
  libxtst6 \
  fonts-liberation \
  libjpeg-dev \
  libpng-dev \
  libwebp-dev \
  libenchant-2-2 \
  libharfbuzz-icu0 \
  libsecret-1-0 \
  libvpx-dev \
  libwayland-client0 \
  libwayland-egl1 \
  libwayland-cursor0 \
  libxinerama1 \
  libxkbcommon0 \
  xdg-utils \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*


# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
#   PUPPETEER_SKIP_DOWNLOAD=true \
#   CHROME_EXECUTABLE_PATH="/usr/bin/chromium"

ENV FLY="true"
ENV INTERNAL_PORT="8080"
ENV PORT="8080"
ENV NODE_ENV="production"

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules

COPY --from=build /myapp/server-build /myapp/server-build
COPY --from=build /myapp/drizzle /myapp/drizzle
COPY --from=build /myapp/build /myapp/build
COPY --from=build /myapp/package.json /myapp/package.json
COPY --from=build /myapp/app/components/ui/icons /myapp/app/components/ui/icons

# ✅ THIS LINE FIXES THE PLAYWRIGHT ERROR
COPY --from=deps /root/.cache /root/.cache

ADD . .

CMD ["npm", "start"]