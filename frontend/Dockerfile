FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build          

FROM node:18-slim
WORKDIR /app
RUN npm install -g serve   # lightweight static file server
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]