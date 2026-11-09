@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo Starting TokTrend Flow on http://localhost:3000 ...
call "C:\Program Files\nodejs\npm.cmd" run dev
