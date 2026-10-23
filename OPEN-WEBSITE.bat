@echo off
title Zira Forex
cd /d "%~dp0"
where python >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:4190/index.html
  python -m http.server 4190
) else (
  start "" "%~dp0index.html"
)
