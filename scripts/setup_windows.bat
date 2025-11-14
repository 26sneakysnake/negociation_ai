@echo off
REM Quick Setup Script for Windows (Batch version)
REM For users who can't run PowerShell scripts

echo.
echo 🎯 NegotiAI Coach - Windows Setup
echo ===================================
echo.

REM Check Python
echo Checking Python version...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Python not found
    echo Please install Python 3.11+ from python.org
    pause
    exit /b 1
)

python --version
echo ✓ Python found
echo.

REM Create venv
echo Creating virtual environment...
if exist venv (
    echo ⚠ Virtual environment already exists
    set /p recreate="Recreate it? (y/n): "
    if /i "%recreate%"=="y" (
        rmdir /s /q venv
        python -m venv venv
        echo ✓ Virtual environment recreated
    )
) else (
    python -m venv venv
    echo ✓ Virtual environment created
)
echo.

REM Activate venv
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo ✓ Virtual environment activated
echo.

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip --quiet
echo ✓ pip upgraded
echo.

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ✗ Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

REM Create .env
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo ✓ .env file created
    echo ⚠ Don't forget to add your API keys in .env
) else (
    echo ✓ .env file already exists
)
echo.

REM Frontend
set /p frontend="Install frontend dependencies (requires Node.js)? (y/n): "
if /i "%frontend%"=="y" (
    where npm >nul 2>&1
    if %errorlevel% equ 0 (
        echo Installing frontend dependencies...
        cd frontend
        call npm install
        cd ..
        echo ✓ Frontend dependencies installed
    ) else (
        echo ⚠ npm not found, skipping frontend
    )
)
echo.

REM Summary
echo ===================================
echo ✓ Setup Complete!
echo.
echo Next steps:
echo 1. Edit .env and add your API keys
echo 2. Start the application:
echo.
echo    python start_simple.py
echo.
echo 3. Install browser extension from browser-extension/
echo.
echo Happy negotiating! 🎯
echo.
pause
