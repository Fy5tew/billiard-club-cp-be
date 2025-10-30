FROM node:24-alpine AS build

WORKDIR /app

ARG APP_NAME

COPY package*.json ./

RUN npm install --frozen-lockfile

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY libs ./libs
COPY apps/api-gateway ./apps/api-gateway

RUN npm run build api-gateway


FROM node:24-alpine AS production

WORKDIR /app

ARG APP_NAME

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist/apps/api-gateway ./

CMD ["node", "main.js"]
