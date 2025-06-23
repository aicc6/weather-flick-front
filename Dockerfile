FROM node:22-alpine AS base

COPY . /app

WORKDIR /app

FROM base AS builder
RUN npm ci && npm run build

FROM nginx:1.27.5-alpine3.21 AS app

COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /var/www/html/

EXPOSE 80

ENTRYPOINT ["nginx","-g","daemon off;"]
