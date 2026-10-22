@echo off
title GEOPHARMA Launcher
color 0A
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not added to PATH.
    pause
    exit /b
)

if not exist "node_modules" (
    echo Installing dependencies...
    call npm run install:all
)

if not exist ".env" (
    if exist ".env.example" copy ".env.example" ".env" >nul
    echo Created .env from .env.example - fill in your secrets, then run this again.
    pause
    exit /b
)

start "" "http://localhost:5173"
call npm run dev
