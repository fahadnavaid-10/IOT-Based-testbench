@echo off
title IoT Telemetry Simulator
echo ====================================================
echo Starting Node Telemetry Simulator...
echo ====================================================
cd /d "%~dp0backend"
venv\Scripts\python.exe simulate_telemetry.py
pause
