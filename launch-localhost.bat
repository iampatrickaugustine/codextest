@echo off
set "ROOT=%~dp0"
set "PORT=8123"
set "BROWSER=C:\Users\iampa\AppData\Local\Google\Chrome\Application\chrome.exe"

if not exist "%ROOT%serve-local.ps1" (
  echo Could not find %ROOT%serve-local.ps1
  pause
  exit /b 1
)

start "LCARS Server" powershell.exe -NoLogo -ExecutionPolicy Bypass -File "%ROOT%serve-local.ps1" -Port %PORT%
ping 127.0.0.1 -n 3 >nul

if exist "%BROWSER%" (
  start "LCARS Interface" "%BROWSER%" "http://127.0.0.1:%PORT%/index.html"
) else (
  echo Chrome was not found at %BROWSER%
  pause
  exit /b 1
)
