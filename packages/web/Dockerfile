FROM node:18-alpine AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat openssl
# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install all dependencies
COPY ./package.json ./package-lock.json* ./
COPY ./packages/web/package.json ./packages/web/
COPY ./packages/shared/package.json ./packages/shared/
COPY ./packages/shared-server/package.json ./packages/shared-server/

# Install deps (not sure if shared install is needed since its transitive)
RUN npm install --production=false

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy the node_modules from root and sub projects. We don't know for sure if the sub projects
# have node_modules, so we use a wildcard to copy them if they exist. (Sub projects only need
# their own node_modules if there's a version conflict with root).
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules* ./packages/shared/node_modules
COPY --from=deps /app/packages/shared-server/node_modules* ./packages/shared-server/node_modules
COPY --from=deps /app/packages/web/node_modules* ./packages/web/node_modules

COPY ./package.json ./package-lock.json* ./
COPY ./packages/web/ ./packages/web/
COPY ./packages/shared/ ./packages/shared/
COPY ./packages/shared-server/ ./packages/shared-server/

# This will invoke a bunch of dev dependencies to build the code.

# - Shared will be built first and will output a generated Prism client in node_modules/@prisma/client
# - NextJS in packages/web will spit out a standalone output in .next/standalone that contains everything it needs to run.
#   (this includes the prism client generated by shared)
RUN npm run build -w packages/shared -w packages/shared-server -w packages/web

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir -p .next
RUN chown nextjs:nodejs .next

# NextJS Standalone output (includes everything it neeeds including node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/static ./packages/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
ENV HOSTNAME="0.0.0.0"

CMD ["node", "/app/packages/web/server.js"]