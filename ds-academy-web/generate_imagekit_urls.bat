@echo off
setlocal enabledelayedexpansion

REM DS Science Academy - bulk ImageKit URL generator.
REM Scans a folder of photos and writes a CSV mapping each filename
REM to its ImageKit URL, ready to paste into the photoUrl column of
REM the Toppers Results bulk-import CSV in the admin panel.
REM
REM This only builds URLs, it does NOT upload anything. You still
REM have to upload the SAME photos to your ImageKit dashboard
REM yourself, with the SAME filenames, into the SAME subfolder you
REM set below. Only the public URL Endpoint ID is used here, no
REM private API key, so this is safe to run without any secrets.
REM
REM How to use:
REM   1. Set IK_SUBFOLDER below to match wherever you upload the
REM      photos inside ImageKit. Leave blank for the root folder.
REM   2. Drag a folder of photos onto this bat file, or double-click
REM      it and type the folder path when asked.
REM   3. Open imagekit_urls.csv inside that folder and copy the
REM      photoUrl column into your Toppers CSV.

set IK_ID=d2apex81m
set IK_SUBFOLDER=

if "%~1"=="" (
    set /p PHOTO_DIR="Photos folder path (or drag a folder onto this file instead): "
) else (
    set "PHOTO_DIR=%~1"
)

if not exist "%PHOTO_DIR%" (
    echo.
    echo Folder not found: %PHOTO_DIR%
    pause
    exit /b 1
)

set "OUT=%PHOTO_DIR%\imagekit_urls.csv"
echo filename,photoUrl> "%OUT%"

set COUNT=0
for %%F in ("%PHOTO_DIR%\*.jpg" "%PHOTO_DIR%\*.jpeg" "%PHOTO_DIR%\*.png" "%PHOTO_DIR%\*.webp" "%PHOTO_DIR%\*.avif") do (
    if exist "%%F" (
        set "FNAME=%%~nxF"
        if "!IK_SUBFOLDER!"=="" (
            echo !FNAME!,https://ik.imagekit.io/%IK_ID%/!FNAME!>> "%OUT%"
        ) else (
            echo !FNAME!,https://ik.imagekit.io/%IK_ID%/!IK_SUBFOLDER!/!FNAME!>> "%OUT%"
        )
        set /a COUNT+=1
    )
)

echo.
echo Done - %COUNT% photo URL(s) written to:
echo   %OUT%
echo.
echo Next steps:
echo   1. Upload these SAME photos to your ImageKit dashboard, same filenames.
echo   2. Open imagekit_urls.csv and copy the photoUrl values you need.
echo   3. Paste into the Toppers bulk-import CSV in the admin panel.
echo.
pause
