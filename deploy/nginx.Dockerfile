# syntax=docker/dockerfile:1
# nginx (headers, cache rules and compression in front of the site) on Chainguard's distroless, nonroot
# image, pinned by digest. TLS is terminated by Cloudflare (see compose.yaml).
FROM cgr.dev/chainguard/nginx@sha256:56827eefb441357ccbbbf2c38074bb942109a0ec433aba9c457be490eef5bdc2
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY deploy/nginx/visitor.conf /etc/nginx/visitor.conf
EXPOSE 8080
