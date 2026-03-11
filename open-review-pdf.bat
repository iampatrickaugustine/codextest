@echo off
set "BROWSER=C:\Users\iampa\AppData\Local\Google\Chrome\Application\chrome.exe"
set "PDF=file:///C:/Users/iampa/OneDrive/Documents/New%%20project/review-pack.pdf"
set "PROFILE=%TEMP%\codex-lcars-review-pdf"

if not exist "%BROWSER%" (
  echo Chrome was not found at %BROWSER%
  pause
  exit /b 1
)

start "LCARS Review PDF" "%BROWSER%" --user-data-dir="%PROFILE%" --new-window "%PDF%"
