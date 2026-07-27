@echo off
title GEOPHARMA Launcher
color 0A

echo ==========================================
echo        GEOPHARMA APPLICATION
echo ==========================================
echo.

:: Change to project root
cd /d "%~dp0"

:: Check Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not added to PATH.
    pause
    exit /b
)

:: ----------------------------
:: Install Client Dependencies
:: ----------------------------
echo [1/5] Checking Client...

if not exist "client\node_modules" (
    echo Installing Client Dependencies...
    cd client
    call npm install
    cd ..
)

if not exist "client\.env" (
    if exist "client\.env.example" (
        copy "client\.env.example" "client\.env" >nul
    )
)

:: ----------------------------
:: Install Server Dependencies
:: ----------------------------
echo [2/5] Checking Server...

if not exist "server\node_modules" (
    echo Installing Server Dependencies...
    cd server
    call npm install
    cd ..
)

if not exist "server\.env" (
    if exist "server\.env.example" (
        copy "server\.env.example" "server\.env" >nul
    )
)

:: ----------------------------
:: Start Backend
:: ----------------------------
echo [3/5] Starting Backend...
start "GEOPHARMA Backend" cmd /k "cd /d "%~dp0server" && npm run dev"

:: ----------------------------
:: Start Frontend
:: ----------------------------
timeout /t 3 >nul

echo [4/5] Starting Frontend...
start "GEOPHARMA Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

:: ----------------------------
:: Wait and Open Browser
:: ----------------------------
echo [5/5] Waiting for Frontend...
timeout /t 8 >nul

start "" "http://localhost:5173"

echo.
echo ==========================================
echo GEOPHARMA is running!
echo ==========================================
echo.
echo Frontend : http://localhost:5173
echo Backend  : Running in separate terminal
echo.

pause