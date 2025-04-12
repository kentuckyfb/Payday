@echo off
echo Building PAYDAY for Windows with Tauri...

rem Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo Error: Node.js is not installed. Please install Node.js and try again.
  exit /b 1
)

rem Run the check script first to verify environment
echo Running environment check...
node check-project.js
if %errorlevel% neq 0 (
  echo Environment check failed. Please fix the issues above before continuing.
  exit /b %errorlevel%
)

rem Run the build script
node build-tauri.js
if %errorlevel% neq 0 (
  echo Build failed with error code %errorlevel%.
  exit /b %errorlevel%
)

echo If build was successful, your executable should be in src-tauri/target/release/bundle
