# The scan browser: chromedp's headless shell plus fonts for every site language, so a share card
# rendered for /zh/, /ja/, /hi/ or /bn/ (and pages scanned in those scripts) shows text, not boxes. The
# base image has only DejaVu (Latin, Cyrillic). Noto: SIL OFL 1.1.
FROM chromedp/headless-shell:158.0.8127.18
RUN apt-get update \
 && apt-get install -y --no-install-recommends fonts-noto-core fonts-noto-cjk \
 && rm -rf /var/lib/apt/lists/*
