@echo off
REM Botwaffle Character Nexus - Complete Rebuild Script (Windows)
REM This script deletes everything and rebuilds from scratch

echo.
echo ========================================
echo Botwaffle Character Nexus - Rebuild
echo ========================================
echo.

REM Configuration
set REPO_URL=https://github.com/Fablestarexpanse/botwaffle-character-nexus.git
set BRANCH=claude/setup-botwaffle-nexus-01TYC78H8etA5cGmwWBLvGYQ
set PROJECT_NAME=botwaffle-character-nexus
set INSTALL_DIR=%USERPROFILE%\%PROJECT_NAME%

REM Step 1: Delete old installation
echo [1/5] Cleaning up old installation...
if exist "%INSTALL_DIR%" (
  echo    Deleting %INSTALL_DIR%...
  rmdir /s /q "%INSTALL_DIR%"
  echo    Done: Old installation removed
) else (
  echo    Info: No previous installation found
)
echo.

REM Step 2: Clone repository
echo [2/5] Cloning repository...
cd /d "%USERPROFILE%"
git clone -b %BRANCH% %REPO_URL% %PROJECT_NAME%
if errorlevel 1 (
  echo ERROR: Failed to clone repository
  pause
  exit /b 1
)
cd "%INSTALL_DIR%"
echo    Done: Repository cloned from branch %BRANCH%
echo.

REM Step 3: Install dependencies
echo [3/5] Installing dependencies...

echo    Installing root dependencies...
call npm install
if errorlevel 1 (
  echo ERROR: Failed to install root dependencies
  pause
  exit /b 1
)

echo    Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
  echo ERROR: Failed to install backend dependencies
  pause
  exit /b 1
)
cd ..

echo    Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
  echo ERROR: Failed to install frontend dependencies
  pause
  exit /b 1
)
cd ..

echo    Done: All dependencies installed
echo.

REM Step 4: Initialize database
echo [4/5] Initializing database...
cd backend
if exist "db.sqlite" (
  del /f /q "db.sqlite"
  echo    Removed old database
)
echo    Database will be initialized on first server start
cd ..
echo    Done: Database ready
echo.

REM Step 5: Display completion message
echo.
echo ========================================
echo         REBUILD COMPLETE!
echo ========================================
echo.
echo Project location: %INSTALL_DIR%
echo.
echo To start the application, run ONE of these commands:
echo.
echo   Option 1 - Both servers (recommended):
echo   cd %INSTALL_DIR% ^&^& npm run dev
echo.
echo   Option 2 - Backend only:
echo   cd %INSTALL_DIR% ^&^& npm run backend
echo.
echo   Option 3 - Frontend only:
echo   cd %INSTALL_DIR% ^&^& npm run frontend
echo.
echo Once started:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3000
echo.
echo Notes:
echo   - JanitorAI URL import requires: cd backend ^&^& npm install puppeteer
echo   - JSON file import works out of the box
echo   - Manual character creation works immediately
echo.
echo.
pause
