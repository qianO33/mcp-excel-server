FROM node:18-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY ./ /app
COPY tsconfig.json /tsconfig.json

RUN --mount=type=cache,target=/root/.npm pnpm install

RUN --mount=type=cache,target=/root/.npm-production npm ci --ignore-scripts --omit-dev


FROM node:18-alpine AS release

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

ENV NODE_ENV=production

RUN npm ci --ignore-scripts --omit-dev

ENTRYPOINT ["node", "/app/dist/index.js"]
