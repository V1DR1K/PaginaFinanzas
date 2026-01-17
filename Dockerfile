# Etapa de build
FROM node:24 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Etapa de servidor
FROM nginx:alpine
COPY --from=build /app/dist/angular-control-flow-syntax /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
