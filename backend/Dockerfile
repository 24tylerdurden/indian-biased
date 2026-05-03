FROM golang:1.26-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates

COPY go.mod ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -a -ldflags="-s -w" -o main .

FROM alpine:latest

RUN apk --no-cache add ca-certificates postgresql-client wget

WORKDIR /app

COPY --from=builder /app/main ./main
COPY --from=builder /app/schema.sql ./schema.sql

RUN chmod +x ./main

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --spider -q http://localhost:8080/api/auth/me || exit 1

CMD ["./main"]
