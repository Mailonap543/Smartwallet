FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

FROM node:22-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

EXPOSE 4200

CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]

FROM nginx:alpine

COPY --from=builder /app/dist/smartwallet-front/browser /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/smartwallet.conf

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
