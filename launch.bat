@echo off
TITLE CycloneOps - Disaster Operations Launch Control
COLOR 0B
SETLOCAL EnableDelayedExpansion

echo ===============================================================================
echo        CENTRALIZED CYCLONE DISASTER MANAGEMENT PLATFORM (CYCLONEOPS)
echo ===============================================================================
echo.

:: Ensure current working directory is the folder where launch.bat lives
cd /d "%~dp0"

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not detected in your PATH!
    echo Please install Node.js from https://nodejs.org/ before launching.
    echo.
    pause
    exit /b 1
)

:: 2. Check server and client directories
if not exist "server\" (
    echo [ERROR] server\ directory not found in %~dp0
    pause
    exit /b 1
)

if not exist "client\" (
    echo [ERROR] client\ directory not found in %~dp0
    pause
    exit /b 1
)

echo [1/3] Launching CycloneOps Backend API on Port 5000...
start "CycloneOps - Backend API (Port 5000)" cmd /k "title CycloneOps Backend API [Port 5000] && color 0A && cd /d "%~dp0server" && echo Starting Backend Server... && npm start"

:: Wait 3 seconds for backend to initialize
echo [2/3] Waiting for Backend to initialize...
timeout /t 3 /nobreak >nul

echo [3/3] Launching CycloneOps Frontend Client on Port 5173...
start "CycloneOps - Frontend Client (Port 5173)" cmd /k "title CycloneOps Frontend Client [Port 5173] && color 0E && cd /d "%~dp0client" && echo Starting Vite Dev Server... && npm run dev"

:: Wait 3 seconds for Vite server to spin up
timeout /t 3 /nobreak >nul

:: Automatically open browser to localhost:5173
echo.
echo Opening browser at http://localhost:5173/ ...
start http://localhost:5173/

echo.
echo ===============================================================================
echo  [SUCCESS] All CycloneOps services are running!
echo ===============================================================================
echo   * Backend REST API  : http://localhost:5000/
echo   * Frontend Client   : http://localhost:5173/
echo ===============================================================================
echo.
echo Leave the two opened command windows running while using the platform.
echo To stop the application later, simply close those two command windows.
echo.
pause
