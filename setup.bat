@echo off
setlocal enabledelayedexpansion

echo ================================================
echo 🏦 Payment Dashboard Setup (Windows)
echo ================================================

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [SUCCESS] Node.js is installed: !NODE_VERSION!
)

:: Check if MongoDB is available
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB is not installed locally. You can:
    echo   1. Install MongoDB locally: https://docs.mongodb.com/manual/installation/
    echo   2. Use MongoDB Atlas (cloud): https://www.mongodb.com/atlas
    echo   3. Use Docker: docker run -d -p 27017:27017 mongo:7.0
) else (
    echo [SUCCESS] MongoDB is installed
)

:: Setup backend
echo [INFO] Setting up backend...
cd server

echo [INFO] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

:: Create .env file if it doesn't exist
if not exist .env (
    echo [INFO] Creating .env file...
    (
        echo MONGODB_URI=mongodb://localhost:27017/payment-dashboard
        echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
        echo JWT_EXPIRES_IN=24h
        echo PORT=3000
    ) > .env
    echo [SUCCESS] .env file created
) else (
    echo [WARNING] .env file already exists
)

cd ..
echo [SUCCESS] Backend setup completed

:: Setup frontend
echo [INFO] Setting up frontend...
cd client

echo [INFO] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)

:: Check if Expo CLI is installed
expo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Expo CLI is not installed globally
    echo [INFO] Installing Expo CLI...
    call npm install -g @expo/cli
)

cd ..
echo [SUCCESS] Frontend setup completed

:: Create placeholder assets
echo [INFO] Creating placeholder assets...
if not exist client\assets mkdir client\assets
echo. > client\assets\icon.png
echo. > client\assets\splash.png
echo. > client\assets\adaptive-icon.png
echo. > client\assets\favicon.png
echo [SUCCESS] Placeholder assets created

echo.
echo ==================================================
echo [SUCCESS] Setup completed successfully! 🎉
echo ==================================================
echo.
echo 📋 Next steps:
echo 1. Start MongoDB (if using local installation)
echo 2. Start the backend server:
echo    cd server ^&^& npm run start:dev
echo.
echo 3. In a new terminal, start the frontend:
echo    cd client ^&^& npm start
echo.
echo 4. Use these credentials to login:
echo    Admin: admin / admin123
echo    Viewer: viewer / viewer123
echo.
echo 📚 Documentation:
echo    - Main README: ./README.md
echo    - Backend README: ./server/README.md
echo    - Frontend README: ./client/README.md
echo.
echo 🐳 Docker alternative:
echo    docker-compose up -d
echo.
echo [SUCCESS] Happy coding! 🚀

pause