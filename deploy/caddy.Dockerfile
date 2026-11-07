# syntax=docker/dockerfile:1
# Caddy (TLS and HTTP/3 in front of the site), as a static binary on a distroless, nonroot image.

FROM caddy:2.11.9 AS caddy
RUN mkdir -p /out/data /out/config

FROM gcr.io/distroless/static-debian13:nonroot
COPY --from=caddy /usr/bin/caddy /usr/bin/caddy
COPY --from=caddy --chown=nonroot:nonroot /out/data /data
COPY --from=caddy --chown=nonroot:nonroot /out/config /config
COPY deploy/Caddyfile /etc/caddy/Caddyfile
ENV XDG_DATA_HOME=/data XDG_CONFIG_HOME=/config
USER nonroot
EXPOSE 80 443 443/udp
ENTRYPOINT ["/usr/bin/caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
