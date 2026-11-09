FROM oven/bun:1-alpine AS build

WORKDIR /app
COPY package.json ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1-alpine AS production

WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN bun install --production
COPY --from=build /app/dist ./dist
COPY public ./dist/public

EXPOSE 3000
CMD ["bun", "run", "start"]
