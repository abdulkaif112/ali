@echo off
echo Starting GitHub PR update...

cd /d "c:\Users\hp\Downloads\ali-enterprises"

echo Current directory: %CD%

REM Check git status
echo.
echo Checking git status...
git status

REM Add all files
echo.
echo Adding files...
git add .

REM Commit if there are changes
echo.
echo Committing changes...
git commit -m "Update: %date% %time%"

REM Push to remote
echo.
echo Pushing to GitHub...
git push origin main

echo.
echo GitHub update completed!
echo Repository: https://github.com/abdulkaif112/ali
echo.
pause