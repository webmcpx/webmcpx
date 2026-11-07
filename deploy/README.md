# Deploying webmcpx.dev

The site and scan API run as three containers ([compose.yaml](compose.yaml)):

| Service | Image | Runs as | Network |
|---|---|---|---|
| `caddy` | Caddy, static binary on `distroless/static-debian13` | nonroot | `edge`: ports 80, 443 (TCP and UDP) |
| `web` | Rust server and the prerendered landing on `distroless/cc-debian13` (site built with Node 26 LTS) | nonroot | `edge` and `scan` |
| `chrome` | `chromedp/headless-shell`, pinned | nobody, read-only | `scan` only |

## Security model

- **The scan browser has no route to the network.** `scan` is an internal Docker network. Chrome's only way
  out is the egress proxy inside `web`, which resolves every host itself, refuses private, loopback,
  link-local and reserved addresses (redirects, subresources and DNS rebinding included), caps each
  connection at 60 s and 16 MiB, and serves only the `chrome` container.
- **Least privilege everywhere.** Every container drops all Linux capabilities, runs with
  `no-new-privileges` and a read-only root filesystem, and has memory and process limits.
- **No secrets.** The stack needs none: TLS certificates come from Let's Encrypt through Caddy and live in a
  Docker volume.
- **Rootless.** On webmcpx.dev the stack runs under a dedicated user with
  [rootless Docker](https://docs.docker.com/engine/security/rootless/), so even a container escape lands
  in an unprivileged account.

## Run it

Point your domain's `A`/`AAAA` records at the server, then:

```sh
echo "WEBMCPX_DOMAIN=example.com" > deploy/.env    # git-ignored
docker compose -f deploy/compose.yaml --env-file deploy/.env up -d --build
```

Update: `git pull` and the same command. Logs: `docker compose -f deploy/compose.yaml logs -f web`.

### Rootless Docker on a dedicated user (Debian)

```sh
# as root
apt-get install -y uidmap dbus-user-session slirp4netns docker-ce-rootless-extras
adduser --disabled-password --gecos "" webmcpx
loginctl enable-linger webmcpx                      # keep its services running after logout
setcap cap_net_bind_service=ep "$(command -v rootlesskit)"   # let rootless Docker publish 80 and 443

# as webmcpx
dockerd-rootless-setuptool.sh install
systemctl --user enable --now docker
```
