FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY libs ./libs
COPY apps/storage ./apps/storage

RUN npm run build storage


FROM node:24-alpine AS production

WORKDIR /app

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist/apps/storage ./

CMD ["node", "main.js"]
