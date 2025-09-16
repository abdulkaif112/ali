@echo off
echo === UPLOADING TO GITHUB ===
cd /d "c:\Users\hp\Downloads\ali-enterprises"

echo Checking Git...
git --version
if %errorlevel% neq 0 (
    echo Git not found! Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo Adding files...
git add .

echo Committing changes...
git commit -m "Update: %date% %time%"

echo Pushing to GitHub...
git push origin main

echo SUCCESS! Visit https://github.com/abdulkaif112/ali to create a PR
pause