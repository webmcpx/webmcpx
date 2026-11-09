# syntax=docker/dockerfile:1
# The webmcpx site and scan API: the prerendered landing (built with Node LTS) served by the Rust server,
# on a distroless, nonroot runtime. Chrome runs in its own container (see compose.yaml).

FROM rust:1.99.1-slim-trixie AS server
WORKDIR /src
COPY . .
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/src/target \
    cargo build --profile release-server --locked -p webmcpx-bench \
 && cp target/release-server/webmcpx-bench /webmcpx \
 && mkdir /data

FROM node:26.13.0-trixie-slim AS site
WORKDIR /site
COPY site/package.json site/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY site/ ./
# llms-full.txt quotes the README and the agent skill.
COPY README.md /README.md
COPY skills/webmcpx/SKILL.md /skills/webmcpx/SKILL.md
RUN npm run build

FROM gcr.io/distroless/cc-debian13:nonroot
COPY --from=server /webmcpx /usr/local/bin/webmcpx
COPY --from=site /site/build /srv/site/build
# The scan log's volume: a new volume takes this directory's owner (nonroot).
COPY --from=server --chown=65532:65532 /data /data
USER nonroot
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/webmcpx", "serve", "--root", "/srv", "--addr", "0.0.0.0:8080", \
            "--remote-chrome", "chrome:9222", "--proxy-listen", "0.0.0.0:3128"]
