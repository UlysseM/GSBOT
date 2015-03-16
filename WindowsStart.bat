@echo off
echo Starting GSBOT

:: check if nodejs is in the path, put it in "found"
set FOUND=
for %%e in (%PATHEXT%) do (
  for %%X in (node%%e) do (
    if not defined FOUND (
      set FOUND=%%~$PATH:X
    )
  )
)


if not defined FOUND (
  echo "Make sure you have nodeJS installed (and in the PATH)."
  pause
) else (
  node app.js
  pause
)