@echo off
title IoT Testbed Launcher
echo ====================================================
echo Starting Remote IoT Testbed (Backend + Frontend)...
echo ====================================================

set SCRIPT_DIR=%~dp0
set BACKEND_DIR=%SCRIPT_DIR%fyp-software\Software\Source\backend
set FRONTEND_DIR=%SCRIPT_DIR%fyp-software\Software\Source\Frontend

if not exist "%BACKEND_DIR%\venv\Scripts\python.exe" (
    echo [WARNING] Backend virtualenv not found! Running setup first...
    call "%SCRIPT_DIR%setup.bat"
)

start "IoT Backend (Flask)" cmd /k "cd /d "%BACKEND_DIR%" && venv\Scripts\python.exe run.py"
timeout /t 3 /nobreak >nul
start "IoT Frontend (Vite)" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

echo.
echo ====================================================
echo [OK] Both Backend and Frontend are launching!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:8080 (or check Vite window)
echo.
echo Default Login Credentials:
echo   Admin:      admin@iot.dev / password
echo   Researcher: researcher@iot.dev / password
echo ====================================================
pause
