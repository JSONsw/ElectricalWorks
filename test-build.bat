@echo off
REM Test build script for Windows - run this locally before deploying

echo Checking Node version...
node -v
npm -v

echo.
echo Installing dependencies...
call npm install

echo.
echo Running build...
call npm run build

echo.
if %ERRORLEVEL% EQU 0 (
    echo Build successful! Ready to deploy.
) else (
    echo Build failed. Check errors above.
    exit /b 1
)

