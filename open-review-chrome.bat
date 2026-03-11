@echo off
set "BROWSER=C:\Users\iampa\AppData\Local\Google\Chrome\Application\chrome.exe"
set "REVIEW=file:///C:/Users/iampa/OneDrive/Documents/New%%20project/review.html"
set "PROFILE=%TEMP%\codex-lcars-review"

if not exist "%BROWSER%" (
  echo Chrome was not found at %BROWSER%
  pause
  exit /b 1
)

start "LCARS Review" "%BROWSER%" --user-data-dir="%PROFILE%" --new-window "%REVIEW%"
