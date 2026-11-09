@echo off
set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"
cd /d "%~dp0"
echo Men-deploy pembaruan TokTrend Flow ke Production (https://toktrend.onyou.cyou)...
if defined VERCEL_TOKEN (
  call vercel.cmd deploy --prod --yes --token %VERCEL_TOKEN%
) else (
  call vercel.cmd deploy --prod --yes
)
