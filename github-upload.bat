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
git config user.name "salmanajju2"
git config user.email "your-email@example.com"

REM Commit files
echo Committing files...
git commit -m "Initial commit: ALI ENTERPRISES transaction management app with Firebase authentication"

REM Set main branch
echo Setting main branch...
git branch -M main

REM Add remote origin
echo Adding remote origin...
git remote add origin https://github.com/salmanajju2/aa.git

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin main

echo Done! Check your repository at: https://github.com/salmanajju2/aa
pause