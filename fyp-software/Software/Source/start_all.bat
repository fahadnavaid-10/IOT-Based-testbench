@echo off
title IoT Testbed Launcher
echo ====================================================
echo Starting Remote IoT Testbed (Backend + Frontend)...
echo ====================================================
start "IoT Backend (Flask)" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe run.py"
timeout /t 3 /nobreak >nul
start "IoT Frontend (Vite)" cmd /k "cd /d "%~dp0Frontend" && npm run dev"
echo.
echo ====================================================
echo [OK] Both Backend and Frontend are launching!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:8080 (or check the Vite window)
echo.
echo Login Credentials:
echo Admin:      admin@iot.dev / password
echo Researcher: researcher@iot.dev / password
echo ====================================================
pause
