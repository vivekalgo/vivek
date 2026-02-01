@echo off
REM AI Legal Sentinel - Quick Start Batch Script
REM Run this file to start the server automatically

echo.
echo ========================================
echo AI Legal Sentinel - Server Startup
echo ========================================
echo.

REM Check if in correct directory
cd /d "C:\Users\yadav\OneDrive\Desktop\New folder\backend"

echo Checking Python environment...
python --version

echo.
echo Setting environment variables...
set PYTHONIOENCODING=utf-8
set GEMINI_API_KEY=AIzaSyDVK7PblqayVc9k82UBQU8onSFMlITZjmg

echo.
echo Killing any process on port 8000...
netstat -ano | findstr :8000 | for /f "tokens=5" %%a in ('more') do taskkill /PID %%a /F 2>nul

timeout /t 2 /nobreak

echo.
echo ========================================
echo Starting FastAPI Server...
echo ========================================
echo.
echo Server will start at: http://127.0.0.1:8000
echo API Docs at: http://127.0.0.1:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python main.py

pause
