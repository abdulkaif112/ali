@echo off
echo Uploading ALI ENTERPRISES to GitHub...

REM Check if git is installed
git --version
if %errorlevel% neq 0 (
    echo Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Initialize git repository
echo Initializing git repository...
git init

REM Add all files
echo Adding all files...
git add .

REM Configure git user (replace with your details)
echo Setting up git user...
git config user.name "abdulkaif112"
git config user.email "abdulkaif112@gmail.com"

REM Commit files
echo Committing files...
git commit -m "Update: Latest changes and improvements"

REM Set main branch
echo Setting main branch...
git branch -M main

REM Check and add remote origin
echo Checking remote origin...
git remote -v
echo Adding/updating remote origin...
git remote set-url origin https://github.com/abdulkaif112/ali.git || git remote add origin https://github.com/abdulkaif112/ali.git

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin main

echo Done! Check your repository at: https://github.com/abdulkaif112/ali
pause