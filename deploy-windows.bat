@echo off
setlocal
title Turtle Mountain Forest Nursery - publish site
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js isn't installed yet.
  echo Opening nodejs.org - install the LTS version, then double-click this file again.
  start "" https://nodejs.org/
  pause
  exit /b 1
)

echo.
echo [1/5] Installing Wrangler, Cloudflare's publishing tool. The first time takes a minute...
call npm install --no-fund --no-audit
if errorlevel 1 goto fail

echo.
echo [2/5] Downloading public-domain tree photos you don't have yet...
call npm run images
if errorlevel 1 echo Photos skipped. Species without a photo show a drawn silhouette.

echo.
echo [3/5] Signing in to Cloudflare. If a browser window opens, click Allow...
call npx wrangler whoami 2>nul | findstr /i /c:"You are logged in" >nul
if errorlevel 1 (
  call npx wrangler login
  if errorlevel 1 goto fail
)

echo.
echo [4/5] Publishing the site...
call npm run deploy
if errorlevel 1 goto fail

if exist ".owner-key-set" goto done
echo.
echo [5/5] Choose a password for your owner dashboard at /owner/
echo       Type it, then press Enter. It may not show on screen while you type.
call npx wrangler secret put OWNER_KEY
if errorlevel 1 goto fail
echo set>".owner-key-set"

:done
echo.
echo ==========================================================
echo  Done. Your site is live at the workers.dev link above.
echo  Place a test reservation, then open /owner/ and sign in.
echo  Run this file again any time you change the site.
echo ==========================================================
pause
exit /b 0

:fail
echo.
echo Something went wrong. Scroll up for the error message, or paste it to Claude.
pause
exit /b 1
