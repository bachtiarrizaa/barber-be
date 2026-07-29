# ---- Base (dependencies untuk dev & build) ----
FROM node:24-alpine AS base
WORKDIR /app

# bcrypt butuh compile native (node-gyp) - alpine tidak ada build tools bawaan
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

# ---- Development ----
FROM base AS dev
ARG UID=1000
ARG GID=1000
RUN chown -R node:node /app
USER node
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# ---- Build (compile TypeScript ke dist/) ----
FROM base AS build
COPY . .
RUN npm run build

# ---- Production ----
FROM node:24-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev \
  && npm cache clean --force \
  && apk del python3 make g++

COPY --from=build /app/dist ./dist

RUN chown -R node:node /app
USER node

EXPOSE 3000
CMD ["node", "dist/main"]