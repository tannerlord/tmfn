#!/bin/bash
# Double-click to publish the site. First time: right-click > Open if macOS warns about it.
cd "$(dirname "$0")" || exit 1
pause() { echo; read -n 1 -s -r -p "Press any key to close..."; echo; }
fail() { echo; echo "Something went wrong. Scroll up for the error message, or paste it to Claude."; pause; exit 1; }

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js isn't installed yet. Opening nodejs.org: install the LTS version, then run this again."
  open "https://nodejs.org/"
  pause; exit 1
fi

echo; echo "[1/5] Installing Wrangler, Cloudflare's publishing tool. The first time takes a minute..."
npm install --no-fund --no-audit || fail

echo; echo "[2/5] Downloading public-domain tree photos you don't have yet..."
npm run images || echo "Photos skipped. Species without a photo show a drawn silhouette."

echo; echo "[3/5] Signing in to Cloudflare. If a browser window opens, click Allow..."
if ! npx wrangler whoami 2>/dev/null | grep -qi "you are logged in"; then
  npx wrangler login || fail
fi

echo; echo "[4/5] Publishing the site..."
npm run deploy || fail

if [ ! -f .owner-key-set ]; then
  echo; echo "[5/5] Choose a password for your owner dashboard at /owner/"
  echo "      Type it, then press Enter. It may not show on screen while you type."
  npx wrangler secret put OWNER_KEY || fail
  touch .owner-key-set
fi

echo
echo "=========================================================="
echo " Done. Your site is live at the workers.dev link above."
echo " Place a test reservation, then open /owner/ and sign in."
echo " Run this file again any time you change the site."
echo "=========================================================="
pause
