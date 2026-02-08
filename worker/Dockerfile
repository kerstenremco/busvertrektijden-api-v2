# Stage 1: Build
FROM node:24-slim AS builder

RUN corepack enable

WORKDIR /opt/app
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Stage 2: Production
FROM node:24-slim AS production

RUN corepack enable

WORKDIR /opt/app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /opt/app/dist ./dist

ENV NODE_ENV=production

# Run app
CMD ["node", "dist/cron.js"]