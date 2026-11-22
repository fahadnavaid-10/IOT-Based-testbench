@echo off
title IoT Testbed Backend (Flask)
cd /d "%~dp0backend"
echo ==============================================
echo Starting IoT Testbed Backend on port 5000...
echo ==============================================
venv\Scripts\python.exe run.py
pause
