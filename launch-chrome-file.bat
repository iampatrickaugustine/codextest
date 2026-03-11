@echo off
set "BROWSER=C:\Users\iampa\AppData\Local\Google\Chrome\Application\chrome.exe"
set "FILE=file:///C:/Users/iampa/OneDrive/Documents/New%%20project/index.html"

if not exist "%BROWSER%" (
  echo Chrome was not found at %BROWSER%
  pause
  exit /b 1
)

start "LCARS Interface" "%BROWSER%" "%FILE%"
