FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.20.0 --activate

COPY . .

RUN pnpm config set fetch-timeout 1800000
RUN pnpm install --frozen-lockfile

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production

RUN pnpm --filter web build


FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.20.0 --activate

ENV NODE_ENV=production

COPY --from=builder /app /app

EXPOSE 3000

CMD ["pnpm", "--filter", "web", "start", "--", "--hostname", "0.0.0.0"]