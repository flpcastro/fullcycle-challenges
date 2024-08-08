FROM golang:1.20-alpine as builder

WORKDIR /app

COPY go.mod ./

COPY main.go .

RUN CGO_ENABLED=0 GOOS=linux go build -o fullcyclerocks

FROM scratch

COPY --from=builder /app/fullcyclerocks /

ENTRYPOINT [ "/fullcyclerocks" ]