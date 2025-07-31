@echo off

REM === Start Backend (in /server) ===
start cmd /k "cd /d %~dp0server && npm run dev"

REM === Start Frontend (in root) ===
start cmd /k "cd /d %~dp0 && npm start"

exit
