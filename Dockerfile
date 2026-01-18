FROM node:24 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/angular-control-flow-syntax/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
