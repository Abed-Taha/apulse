FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.20.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY shared/package.json ./shared/package.json

RUN pnpm config set fetch-timeout 1800000
RUN pnpm install --frozen-lockfile

EXPOSE 3001

CMD ["pnpm", "--filter", "api", "start:dev"]