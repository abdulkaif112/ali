# PowerShell script to update GitHub PR
Write-Host "Starting GitHub PR update process..." -ForegroundColor Green

# Check if git is available
try {
    $gitVersion = & git --version 2>$null
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git not found in PATH. Trying alternative locations..." -ForegroundColor Yellow
    
    # Try common Git installation paths
    $gitPaths = @(
        "C:\Program Files\Git\bin\git.exe",
        "C:\Program Files (x86)\Git\bin\git.exe",
        "C:\Users\$env:USERNAME\AppData\Local\Programs\Git\bin\git.exe"
    )
    
    $gitFound = $false
    foreach ($path in $gitPaths) {
        if (Test-Path $path) {
            Write-Host "Found Git at: $path" -ForegroundColor Green
            Set-Alias -Name git -Value $path -Scope Script
            $gitFound = $true
            break
        }
    }
    
    if (-not $gitFound) {
        Write-Host "Git not found. Please install Git from https://git-scm.com/" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Change to the repository directory
Set-Location "c:\Users\hp\Downloads\ali-enterprises"

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan

# Check git status
Write-Host "`nChecking git status..." -ForegroundColor Yellow
try {
    & git status
} catch {
    Write-Host "Error running git status: $_" -ForegroundColor Red
}

# Check current branch
Write-Host "`nChecking current branch..." -ForegroundColor Yellow
try {
    $currentBranch = & git branch --show-current
    Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan
} catch {
    Write-Host "Error getting current branch: $_" -ForegroundColor Red
}

# Check remote status
Write-Host "`nChecking remote repository..." -ForegroundColor Yellow
try {
    & git remote -v
} catch {
    Write-Host "Error checking remote: $_" -ForegroundColor Red
}

# Add any pending changes
Write-Host "`nAdding any pending changes..." -ForegroundColor Yellow
try {
    & git add .
    Write-Host "Files added successfully" -ForegroundColor Green
} catch {
    Write-Host "Error adding files: $_" -ForegroundColor Red
}

# Check if there are changes to commit
Write-Host "`nChecking for changes to commit..." -ForegroundColor Yellow
try {
    $status = & git status --porcelain
    if ($status) {
        Write-Host "Changes detected, creating commit..." -ForegroundColor Green
        $commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        & git commit -m $commitMessage
        Write-Host "Commit created: $commitMessage" -ForegroundColor Green
    } else {
        Write-Host "No changes to commit" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error checking/committing changes: $_" -ForegroundColor Red
}

# Push to remote repository
Write-Host "`nPushing to remote repository..." -ForegroundColor Yellow
try {
    & git push origin main
    Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
} catch {
    Write-Host "Error pushing to remote: $_" -ForegroundColor Red
    Write-Host "Trying to set upstream..." -ForegroundColor Yellow
    try {
        & git push -u origin main
        Write-Host "Successfully pushed with upstream set!" -ForegroundColor Green
    } catch {
        Write-Host "Failed to push with upstream: $_" -ForegroundColor Red
    }
}

# Provide GitHub repository URL
Write-Host "`nRepository URL: https://github.com/abdulkaif112/ali" -ForegroundColor Cyan
Write-Host "You can create a PR by visiting: https://github.com/abdulkaif112/ali/pulls" -ForegroundColor Cyan

Write-Host "`nGitHub update process completed!" -ForegroundColor Green
Read-Host "Press Enter to exit"