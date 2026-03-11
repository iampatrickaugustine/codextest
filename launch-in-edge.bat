@echo off
set "BROWSER=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set "FILE=%~dp0index.html"
if not exist "%BROWSER%" (
  echo Edge was not found at %BROWSER%
  pause
  exit /b 1
)
if not exist "%FILE%" (
  echo Interface file was not found at %FILE%
  pause
  exit /b 1
)
start "LCARS Interface" "%BROWSER%" "%FILE%"
