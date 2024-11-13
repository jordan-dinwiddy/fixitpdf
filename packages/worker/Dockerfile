# This dockerfile builds an image that is primary used for the FixItPDF worker,
# but also includes the shared package / prism which can be used to run 
# dbmigrations (npx prisma migrate deploy).
#
FROM node:18-alpine AS base

# This deps image has all the node_modules installed (including dev dependencies) and only 
# needs to be rebuilt when the package.json or package-lock.json files change.
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install all dependencies
COPY ./package.json ./package-lock.json* ./
COPY ./packages/worker/package.json ./packages/worker/
COPY ./packages/shared/package.json ./packages/shared/

# Install deps (not sure if shared install is needed since its transitive)
RUN npm install --production=false -w packages/shared -w packages/worker

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/worker/node_modules ./packages/worker/node_modules

COPY ./package.json ./package-lock.json* ./
COPY ./packages/worker/ ./packages/worker/
COPY ./packages/shared/ ./packages/shared/

# This will invoke a bunch of dev dependencies to build the code.
# It outputs packages/worker/dist and packages/shared/dist. 
# It also invokes the prisma client generator, which outputs to node_modules/@prisma/client
RUN npm run build -w packages/shared -w packages/worker

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json* ./
COPY --from=builder /app/packages/worker ./packages/worker/
COPY --from=builder /app/packages/shared ./packages/shared/

# Re-install just the production dependencies (but odly that still includes prisma)
# Omitting dev dependencies to reduce image size (by about 30 MB)
RUN npm install --omit=dev -w packages/worker

# Builds the prism client based on the schema.prisma file 
RUN npm run generate -w packages/shared

# CMD ["node", "server.js"]