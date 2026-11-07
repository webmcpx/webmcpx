#!/usr/bin/env python3
# The webmcpx lockup as outlined SVG (no font needed), for places that cannot load the site fonts: the README,
# slides, other sites. Output: site/static/brand-assets/lockup/{lockup,lockup-ink,lockup-paper}.svg.
#   pip install fonttools brotli uharfbuzz
#   python scripts/lockup.py site/node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2 site/static/brand-assets/lockup
# tracking -0.025em, then the Junction (viewBox 2 4 20 16) at 0.7em high, 0.05em after, on the baseline.
import io, sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import uharfbuzz as hb

font_path, out_dir = sys.argv[1], sys.argv[2]
font = TTFont(font_path)
instantiateVariableFont(font, {"wght": 700}, inplace=True)
buf_bytes = io.BytesIO(); font.flavor = None; font.save(buf_bytes); data = buf_bytes.getvalue()
upm = font["head"].unitsPerEm

face = hb.Face(data); hbfont = hb.Font(face)
buf = hb.Buffer(); buf.add_str("webmcp"); buf.guess_segment_properties()
hb.shape(hbfont, buf, {"kern": True, "liga": True})
glyphs = font.getGlyphSet(); order = font.getGlyphOrder()

S = 100.0 / upm            # 1em = 100 units
track = -0.025 * upm
x = 0.0; d_parts = []
for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
    name = order[info.codepoint]
    pen = SVGPathPen(glyphs, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
    # Font units are y-up: flip to SVG y-down, baseline at y=0.
    tp = TransformPen(pen, (S, 0, 0, -S, (x + pos.x_offset) * S, -pos.y_offset * S))
    glyphs[name].draw(tp)
    d_parts.append(pen.getCommands())
    x += pos.x_advance + track
text_end = x * S                     # includes the trailing letter-spacing, as CSS does
JUNCTION = ["M2 4H6.5L11 11V13L6.5 20H2L7 12Z", "M22 4H17.5L13 11V13L17.5 20H22L17 12Z"]
h = 70.0; k = h / 16.0               # 0.7em high; viewBox 2 4 20 16
jx = text_end + 5.0                  # 0.05em gap
# Junction box: x from jx to jx + 20k, bottom on the baseline (y=0) -> top at -h.
transform = f"matrix({k:.4f} 0 0 {k:.4f} {jx - 2 * k:.3f} {-h - 4 * k:.3f})"
width = jx + 20 * k
asc = font["hhea"].ascent * S; desc = -font["hhea"].descent * S
top, bottom = -asc * 0.78, desc * 0.92
pad = 2
vb = f"{-pad:.1f} {top - pad:.1f} {width + 2 * pad:.1f} {bottom - top + 2 * pad:.1f}"

def svg(fill, title=True):
    paths = "".join(f'<path d="{d}"/>' for d in d_parts if d)
    junction = "".join(f'<path d="{d}"/>' for d in JUNCTION)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" fill="{fill}" role="img" aria-label="webmcpx">'
            f'<title>webmcpx</title>{paths}<g transform="{transform}">{junction}</g></svg>\n')

open(f"{out_dir}/lockup.svg", "w").write(svg("currentColor"))
open(f"{out_dir}/lockup-ink.svg", "w").write(svg("#121210"))
open(f"{out_dir}/lockup-paper.svg", "w").write(svg("#f2f1ed"))
print("viewBox", vb, "upm", upm)
