@echo off
echo Starting Spotify Clone Local Server...
echo.
echo Choose a method to start the server:
echo 1. Python 3 (python -m http.server)
echo 2. Python 2 (python -m SimpleHTTPServer)
echo 3. PHP (php -S localhost:8000)
echo 4. Node.js http-server (npx http-server)
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo Starting Python 3 server on port 8000...
    python -m http.server 8000
) else if "%choice%"=="2" (
    echo Starting Python 2 server on port 8000...
    python -m SimpleHTTPServer 8000
) else if "%choice%"=="3" (
    echo Starting PHP server on port 8000...
    php -S localhost:8000
) else if "%choice%"=="4" (
    echo Starting Node.js http-server on port 8000...
    npx http-server -p 8000
) else (
    echo Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo.
echo Server should be running at: http://localhost:8000
echo Press Ctrl+C to stop the server
pause
