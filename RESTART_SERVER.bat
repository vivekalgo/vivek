@echo off
echo ================================================
echo   Restarting AI Legal Sentinel Backend Server
echo ================================================
echo.
echo [INFO] Stopping any running server on port 8000...
echo.

REM Try to kill any process using port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo [INFO] Killing process %%a on port 8000...
    taskkill /F /PID %%a 2>nul
)

timeout /t 2 /nobreak >nul

echo.
echo [INFO] Starting server with new API key...
echo.

cd backend
python main.py

pause
