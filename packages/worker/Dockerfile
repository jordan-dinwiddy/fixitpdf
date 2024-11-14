# This dockerfile builds an image that is primary used for the FixItPDF worker,
# but also includes the shared package / prism which can be used to run 
# dbmigrations (npx prisma migrate deploy).
#
FROM node:18-alpine AS base

# This deps image has all the node_modules installed (including dev dependencies) and only 
# needs to be rebuilt when the package.json or package-lock.json files change.

#
# Install Rust tools for building the Rust binary
#
FROM rust:1.77 AS rust_builder

# Set up working directory and copy Rust project files
WORKDIR /pdf_annotation_fix
COPY ./packages/worker/pdf_annotation_fix ./

# Specifically adding the musl target statically links musl to the binary (which is needed because we're using alpine)
# "The issue here is likely due to incompatibility between the pdf_annotation_fix binary and the node:18-alpine base 
#  image in your runner container. Alpine Linux uses musl as its standard C library, while the Rust binary is dynamically
#  linked against glibc, which is not available in Alpine. Here are a few solutions to address this"

# Install both musl targets for x86_64 and aarch64
RUN rustup target add x86_64-unknown-linux-musl aarch64-unknown-linux-musl

# Build for the native platform of each architecture at runtime
ARG TARGETPLATFORM
RUN if [ "$TARGETPLATFORM" = "linux/arm64" ]; then \
        cargo build --release --target aarch64-unknown-linux-musl; \
        cp target/aarch64-unknown-linux-musl/release/pdf_annotation_fix pdf_annotation_fix; \
    else \
        cargo build --release --target x86_64-unknown-linux-musl; \
        cp target/x86_64-unknown-linux-musl/release/pdf_annotation_fix pdf_annotation_fix; \
    fi

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

# Copy the node_modules from root and sub projects. We don't know for sure if the sub projects
# have node_modules, so we use a wildcard to copy them if they exist. (Sub projects only need
# their own node_modules if there's a version conflict with root).
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules* ./packages/shared/node_modules
COPY --from=deps /app/packages/worker/node_modules* ./packages/worker/node_modules

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

# Copy the Rust binary from the rust_builder stage
COPY --from=rust_builder /pdf_annotation_fix/pdf_annotation_fix /usr/local/bin/pdf_annotation_fix
# Copy the appropriate binary based on the platform

COPY --from=builder /app/package.json /app/package-lock.json* ./
COPY --from=builder /app/packages/worker ./packages/worker/
COPY --from=builder /app/packages/shared ./packages/shared/

# Re-install just the production dependencies (but odly that still includes prisma)
# Omitting dev dependencies to reduce image size (by about 30 MB)
RUN npm install --omit=dev -w packages/worker

# Builds the prism client based on the schema.prisma file 
RUN npm run generate -w packages/shared

# CMD ["node", "server.js"]