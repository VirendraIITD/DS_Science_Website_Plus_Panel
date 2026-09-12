@echo off
setlocal

REM DS Science Academy - drag a folder of photos onto this file to
REM upload them all to ImageKit and get back real URLs in a CSV.
REM Needs imagekit_upload_secret.txt next to this file (already set up).

if "%~1"=="" (
    set "PHOTO_DIR=%~dp0photos_to_upload"
    echo No folder dragged in - using the default folder:
    echo   %PHOTO_DIR%
    echo.
) else (
    set "PHOTO_DIR=%~1"
)

node "%~dp0imagekit_upload.js" "%PHOTO_DIR%"
pause
