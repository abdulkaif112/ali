@echo off
echo ========================================
echo           GIT PUSH OPERATION
echo ========================================

cd /d "c:\Users\hp\Downloads\ali-enterprises"

echo Current directory: %CD%
echo.

echo [1/5] Checking git status...
git status
if %errorlevel% neq 0 (
    echo ERROR: Git status failed
    goto :error
)
echo.

echo [2/5] Adding all changes...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Git add failed
    goto :error
)
echo.

echo [3/5] Checking if there are changes to commit...
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo No changes to commit, proceeding with push...
) else (
    echo [4/5] Committing changes...
    git commit -m "Update: Latest changes and improvements - %date% %time%"
    if %errorlevel% neq 0 (
        echo ERROR: Git commit failed
        goto :error
    )
)
echo.

echo [5/5] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Git push failed
    echo Trying with upstream set...
    git push -u origin main
    if %errorlevel% neq 0 (
        echo ERROR: Git push with upstream failed
        goto :error
    )
)

echo.
echo ========================================
echo         PUSH COMPLETED SUCCESSFULLY!
echo ========================================
echo Repository: https://github.com/abdulkaif112/ali
echo You can now create a PR at: https://github.com/abdulkaif112/ali/pulls
echo.
goto :end

:error
echo.
echo ========================================
echo              ERROR OCCURRED
echo ========================================
echo Please check the error messages above.
echo.

:end
pause