#!/usr/bin/env python3
"""The README's benchmark chart: every question of one published run, by site, as the token saving with
WebMCP (baseline tokens / WebMCP tokens) on a log scale. Losses (WebMCP used more) sit left of 1x. Nothing
is averaged. Writes docs/assets/benchmark-{light,dark}.svg.

    python3 scripts/bench-chart.py [model]     # default: gpt-6.1-sol (the README's per-site table)
"""

import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODEL = sys.argv[1] if len(sys.argv) > 1 else "gpt-6.1-sol"
RUN = json.loads((ROOT / f"site/src/lib/content/bench/{MODEL}.json").read_text())

# Display names, as the README's table names the sites.
NAMES = {
    "developers.cloudflare.com": "Cloudflare docs",
    "developers.notion.com": "Notion",
    "store": "Kiln & Co (demo store)",
    "specification.website": "specification.website",
    "docs": "Orbit docs (demo)",
    "demo.openforagents.com": "WooCommerce demo",
}


def site_of(task: dict) -> str:
    return task.get("site") or task["url"].split("/")[2]


points: dict[str, list[float]] = {}
for task_id, arms in RUN["summary"]["tasks"].items():
    base, web = arms.get("baseline"), arms.get("webmcp")
    if not base or not web or web["tokens"] <= 0:
        continue
    points.setdefault(site_of(RUN["tasks"][task_id]), []).append(base["tokens"] / web["tokens"])

# Sites by their best question, as in the table.
sites = sorted(points, key=lambda s: -max(points[s]))
lo, hi = 0.25, 64.0  # x axis: 1/4x .. 64x
W, LEFT, RIGHT, TOP, ROW = 880, 210, 30, 64, 40
H = TOP + ROW * len(sites) + 58


def x(ratio: float) -> float:
    r = min(max(ratio, lo), hi)
    return LEFT + (math.log2(r) - math.log2(lo)) / (math.log2(hi) - math.log2(lo)) * (W - LEFT - RIGHT)


def svg(theme: str) -> str:
    ink, muted, grid, win, loss, bg = {
        "light": ("#121210", "#5c5b55", "#dddcd6", "#121210", "#d1383a", "#f2f1ed"),
        "dark": ("#f2f1ed", "#a8a79f", "#3d3c37", "#f2f1ed", "#ff6b5e", "#121210"),
    }[theme]
    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
        f'font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" role="img" '
        f'aria-label="Token saving per question with WebMCP, {RUN["model"]}, by site">',
        f'<rect width="{W}" height="{H}" rx="12" fill="{bg}"/>',
        f'<text x="24" y="34" font-size="17" font-weight="700" fill="{ink}">Tokens saved per question with '
        f'WebMCP · {RUN["model"]}</text>',
        f'<text x="24" y="54" font-size="13" fill="{muted}">Each dot is one question (3 runs each). Right of '
        f'1× WebMCP used fewer tokens; left of it, more. Nothing averaged.</text>',
    ]
    for tick in (0.25, 0.5, 1, 2, 4, 8, 16, 32, 64):
        tx = x(tick)
        label = f"{tick:g}×" if tick >= 1 else f"1/{int(1 / tick)}×"
        out.append(
            f'<line x1="{tx:.1f}" y1="{TOP - 4}" x2="{tx:.1f}" y2="{H - 46}" stroke="{ink if tick == 1 else grid}" '
            f'stroke-width="{1.5 if tick == 1 else 1}"/>'
        )
        out.append(
            f'<text x="{tx:.1f}" y="{H - 28}" font-size="12" text-anchor="middle" fill="{muted}">{label}</text>'
        )
    for i, site in enumerate(sites):
        cy = TOP + ROW * i + ROW / 2
        out.append(
            f'<text x="{LEFT - 14}" y="{cy + 4:.1f}" font-size="13" text-anchor="end" fill="{ink}">'
            f"{NAMES.get(site, site).replace('&', '&amp;')}</text>"
        )
        for ratio in sorted(points[site]):
            color = win if ratio >= 1 else loss
            out.append(
                f'<circle cx="{x(ratio):.1f}" cy="{cy:.1f}" r="6" fill="{color}" fill-opacity=".8"/>'
            )
    out.append(
        f'<text x="{W - RIGHT}" y="{H - 10}" font-size="11" text-anchor="end" fill="{muted}">'
        f"baseline tokens ÷ WebMCP tokens, log scale · webmcpx.dev/#leaderboard</text>"
    )
    out.append("</svg>")
    return "\n".join(out) + "\n"


assets = ROOT / "docs/assets"
assets.mkdir(parents=True, exist_ok=True)
for theme in ("light", "dark"):
    (assets / f"benchmark-{theme}.svg").write_text(svg(theme))
print(f"wrote docs/assets/benchmark-{{light,dark}}.svg from {MODEL}: "
      + ", ".join(f"{NAMES.get(s, s)} {min(points[s]):.1f}–{max(points[s]):.1f}×" for s in sites))
