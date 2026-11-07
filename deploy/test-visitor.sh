#!/usr/bin/env bash
# Checks the scan limit's visitor key (deploy/nginx/visitor.conf) against real nginx: addresses in one
# IPv6 /64 share a key in every form nginx prints them, other /64s and IPv4 addresses do not.
set -euo pipefail
cd "$(dirname "$0")/.."
image=webmcpx-nginx-test
docker build -q -f deploy/nginx.Dockerfile -t "$image" . >/dev/null
id=$(docker run -d --rm -p 127.0.0.1::8080 \
  -v "$PWD/deploy/nginx/test.conf:/etc/nginx/nginx.conf:ro" "$image")
trap 'docker rm -f "$id" >/dev/null' EXIT
port=$(docker port "$id" 8080/tcp | head -1 | sed 's/.*://')
for _ in $(seq 50); do curl -sf "http://127.0.0.1:$port/" >/dev/null && break; sleep 0.1; done
key() { curl -s -H "X-Test-IP: $1" "http://127.0.0.1:$port/"; }
fail=0
expect() {
  local got; got=$(key "$1")
  if [ "$got" != "$2" ]; then echo "FAIL $1 -> $got (want $2)"; fail=1; fi
}
expect 2600:1234::1 2600:1234:0:0::/64
expect 2600:1234::2 2600:1234:0:0::/64
expect 2600:1234:0:0:abcd::1 2600:1234:0:0::/64
expect 2600:1234:0:0:1:2:3:4 2600:1234:0:0::/64
expect 2600:1234:5::1 2600:1234:5:0::/64
expect 2600:1234:5:6:7::1 2600:1234:5:6::/64
expect 2600::1 2600:0:0:0::/64
expect 2804:d55:4020:2b00:fd3c:fb2f:3ea4:a857 2804:d55:4020:2b00::/64
expect 2804:D55:4020:2B00:0:0:0:1 2804:d55:4020:2b00::/64
expect 203.0.113.7 203.0.113.7
[ "$(key 2600:1234::1)" != "$(key 2600:1235::1)" ] || { echo "FAIL different /64s share a key"; fail=1; }
[ "$fail" = 0 ] && echo "visitor keys ok"
exit "$fail"
