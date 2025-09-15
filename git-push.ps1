# Git Push Script for Ali Enterprises
Write-Host "=== GIT PUSH OPERATION ===" -ForegroundColor Green

# Change to project directory
Set-Location "c:\Users\hp\Downloads\ali-enterprises"
Write-Host "Changed to directory: $(Get-Location)" -ForegroundColor Cyan

# Check if git is available
$gitPath = "C:\Program Files\Git\bin\git.exe"
if (Test-Path $gitPath) {
    Write-Host "Git found at: $gitPath" -ForegroundColor Green
} else {
    Write-Host "Git not found! Please install Git from https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Function to run git commands
function Invoke-Git {
    param([string]$Arguments)
    $result = & $gitPath $Arguments.Split(' ')
    return $result
}

try {
    # Check git status
    Write-Host "`n[1/4] Checking git status..." -ForegroundColor Yellow
    Invoke-Git "status --porcelain"
    
    # Add all files
    Write-Host "`n[2/4] Adding all changes..." -ForegroundColor Yellow
    Invoke-Git "add ."
    
    # Check if there are changes to commit
    Write-Host "`n[3/4] Checking for changes..." -ForegroundColor Yellow
    $status = Invoke-Git "status --porcelain"
    
    if ($status) {
        Write-Host "Changes detected, creating commit..." -ForegroundColor Cyan
        $commitMessage = "Update: Latest changes - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        Invoke-Git "commit -m `"$commitMessage`""
        Write-Host "Committed with message: $commitMessage" -ForegroundColor Green
    } else {
        Write-Host "No changes to commit" -ForegroundColor Cyan
    }
    
    # Push to GitHub
    Write-Host "`n[4/4] Pushing to GitHub..." -ForegroundColor Yellow
    try {
        Invoke-Git "push origin main"
        Write-Host "`n✅ PUSH SUCCESSFUL!" -ForegroundColor Green
        Write-Host "Repository: https://github.com/abdulkaif112/ali" -ForegroundColor Cyan
        Write-Host "Create PR: https://github.com/abdulkaif112/ali/pulls" -ForegroundColor Cyan
    } catch {
        Write-Host "Trying with upstream..." -ForegroundColor Yellow
        Invoke-Git "push -u origin main"
        Write-Host "`n✅ PUSH WITH UPSTREAM SUCCESSFUL!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "`n❌ ERROR: $_" -ForegroundColor Red
    Write-Host "Manual steps:" -ForegroundColor Yellow
    Write-Host "1. Open Command Prompt" -ForegroundColor White
    Write-Host "2. Run: cd /d `"c:\Users\hp\Downloads\ali-enterprises`"" -ForegroundColor White
    Write-Host "3. Run: git add ." -ForegroundColor White
    Write-Host "4. Run: git commit -m `"Update`"" -ForegroundColor White
    Write-Host "5. Run: git push origin main" -ForegroundColor White
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")