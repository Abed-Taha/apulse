FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.20.0 --activate

COPY . .

RUN pnpm config set fetch-timeout 1800000
RUN pnpm install --frozen-lockfile

ENV NODE_ENV=production

RUN pnpm --filter api build


FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.20.0 --activate

ENV NODE_ENV=production

COPY --from=builder /app /app

EXPOSE 3001

CMD ["pnpm", "--filter", "api", "start:prod"]