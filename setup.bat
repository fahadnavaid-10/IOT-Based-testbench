@echo off
title IoT Testbed Setup
echo ====================================================
echo   IoT-Based Testbench - Automated Environment Setup
echo ====================================================

set SCRIPT_DIR=%~dp0
set BACKEND_DIR=%SCRIPT_DIR%fyp-software\Software\Source\backend
set FRONTEND_DIR=%SCRIPT_DIR%fyp-software\Software\Source\Frontend

echo.
echo [1/3] Setting up Backend Python Virtual Environment...
cd /d "%BACKEND_DIR%"
if not exist "venv" (
    echo [INFO] Creating Python virtual environment (venv)...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment. Ensure Python is installed and added to PATH.
        goto error
    )
)

if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creating .env from .env.example...
        copy .env.example .env >nul
    )
)

echo [INFO] Installing backend dependencies...
"%BACKEND_DIR%\venv\Scripts\python.exe" -m pip install --upgrade pip
"%BACKEND_DIR%\venv\Scripts\pip.exe" install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies.
    goto error
)

echo.
echo [2/3] Setting up Frontend Dependencies...
cd /d "%FRONTEND_DIR%"
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creating .env from .env.example...
        copy .env.example .env >nul
    )
)

echo [INFO] Running 'npm install'...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install npm packages. Ensure Node.js and npm are installed.
    goto error
)

echo.
echo ====================================================
echo [3/3] [SUCCESS] All dependencies installed successfully!
echo ====================================================
echo You can now start the application by running:
echo     start.bat
echo or
echo     fyp-software\start_project.bat
echo ====================================================
goto end

:error
echo.
echo ====================================================
echo [FAILED] Setup encountered an error. Please check the logs above.
echo ====================================================

:end
cd /d "%SCRIPT_DIR%"
pause
