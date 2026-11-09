# Deploying webmcpx.dev

The site and scan API run as four containers ([compose.yaml](compose.yaml)), with no port open to the
internet:

| Service | Image | Runs as | Network |
|---|---|---|---|
| `tunnel` | `cloudflare/cloudflared`, pinned | nonroot | `edge`: dials out to Cloudflare |
| `nginx` | nginx on Chainguard's distroless image, pinned by digest | nonroot | `edge` |
| `web` | Rust server and the prerendered landing on `distroless/cc-debian13` (site built with Node 26 LTS) | nonroot | `edge` and `scan` |
| `chrome` | `chromedp/headless-shell`, pinned, plus Noto fonts (`chrome.Dockerfile`) | nobody | `scan` only |

## Security model

- **Nothing listens on the internet.** A [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
  connects out to Cloudflare, which terminates TLS and forwards requests to nginx. The server's firewall
  can keep 80 and 443 closed.
- **The scan browser has no route to the network.** `scan` is an internal Docker network. Chrome's only way
  out is the egress proxy inside `web`, which resolves every host itself, refuses private, loopback,
  link-local and reserved addresses (redirects, subresources and DNS rebinding included), caps each
  connection at 60 s and 16 MiB, and serves only the `chrome` container.
- **Fair use.** Each visitor (an IPv4 address or IPv6 /64, from `CF-Connecting-IP`) gets one scan at
  a time; reports are cached for 5 minutes and shared by everyone scanning the same URL (the result says when it
  comes from the cache, and when that copy expires).
- **Least privilege everywhere.** Every container drops all Linux capabilities, runs with
  `no-new-privileges` and a read-only root filesystem, and has memory and process limits where it matters.
- **One secret, never in git.** The tunnel token lives in `deploy/.env` on the server (git-ignored).
- **Rootless.** On webmcpx.dev the stack runs under a dedicated user with
  [rootless Docker](https://docs.docker.com/engine/security/rootless/), so even a container escape lands
  in an unprivileged account.

## Run it

1. In Cloudflare, create a tunnel (Zero Trust → Networks → Tunnels, or the API) and give it a public
   hostname for your domain pointing to `http://nginx:8080`.
2. Put its token on the server and start the stack:

```sh
echo "TUNNEL_TOKEN=<token>" > deploy/.env && chmod 600 deploy/.env    # git-ignored
docker compose -f deploy/compose.yaml --env-file deploy/.env up -d --build
```

Update: `git pull` and the same command. Logs: `docker compose -f deploy/compose.yaml logs -f web`.

Scan counts, all time and per day: `docker compose -f deploy/compose.yaml exec web webmcpx stats /data`.
The scan log (`scans.jsonl` on the `scans` volume) holds what was scanned and what it found, never who
asked: no address, user agent or language. It also brings the week's results (share cards, link previews,
badges) back after a deploy.

### Rootless Docker on a dedicated user (Debian)

```sh
# as root
apt-get install -y uidmap dbus-user-session passt docker-ce-rootless-extras
adduser --disabled-password --gecos "" webmcpx
loginctl enable-linger webmcpx                      # keep its services running after logout

# as webmcpx
dockerd-rootless-setuptool.sh install
systemctl --user enable --now docker
```
