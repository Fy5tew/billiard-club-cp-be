FROM node:20-alpine AS build

WORKDIR /app

ARG APP_NAME

COPY package.json yarn.lock nest-cli.json tsconfig.json tsconfig.build.json ./

COPY apps ./apps
COPY libs ./libs

RUN yarn install --frozen-lockfile

RUN yarn build $APP_NAME


FROM node:20-alpine AS production

WORKDIR /app

ARG APP_NAME

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

COPY --from=build /app/dist/apps/$APP_NAME ./$APP_NAME

CMD node $APP_NAME/main.js