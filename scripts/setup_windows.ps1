# Quick Setup Script for Windows
# PowerShell script for NegotiAI Coach

Write-Host ""
Write-Host "🎯 NegotiAI Coach - Windows Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check Python version
Write-Host "Checking Python version..." -ForegroundColor Blue
$pythonCmd = $null

# Try python command
if (Get-Command python -ErrorAction SilentlyContinue) {
    $version = python --version 2>&1
    if ($version -match "Python (\d+)\.(\d+)") {
        $major = [int]$matches[1]
        $minor = [int]$matches[2]
        if ($major -eq 3 -and $minor -ge 11) {
            $pythonCmd = "python"
        }
    }
}

if (-not $pythonCmd) {
    Write-Host "✗ Python 3.11+ required but not found" -ForegroundColor Red
    Write-Host "Please install Python 3.11 or later from python.org" -ForegroundColor Yellow
    Write-Host "Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✓ Python $version found" -ForegroundColor Green

# Create virtual environment
Write-Host ""
Write-Host "Creating virtual environment..." -ForegroundColor Blue

if (Test-Path "venv") {
    Write-Host "⚠ Virtual environment already exists" -ForegroundColor Yellow
    $recreate = Read-Host "Recreate it? (y/n)"
    if ($recreate -eq "y") {
        Remove-Item -Recurse -Force venv
        & $pythonCmd -m venv venv
        Write-Host "✓ Virtual environment recreated" -ForegroundColor Green
    }
} else {
    & $pythonCmd -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Blue
& .\venv\Scripts\Activate.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Failed to activate. You may need to run:" -ForegroundColor Yellow
    Write-Host "  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
    Write-Host ""
    $setPol = Read-Host "Set execution policy now? (y/n)"
    if ($setPol -eq "y") {
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
        & .\venv\Scripts\Activate.ps1
    }
}

Write-Host "✓ Virtual environment activated" -ForegroundColor Green

# Upgrade pip
Write-Host ""
Write-Host "Upgrading pip..." -ForegroundColor Blue
python -m pip install --upgrade pip --quiet
Write-Host "✓ pip upgraded" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies (this may take a few minutes)..." -ForegroundColor Blue
pip install -r requirements.txt
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    pause
    exit 1
}

# Create .env if needed
Write-Host ""
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Blue
    Copy-Item .env.example .env
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host "⚠ Don't forget to add your API keys in .env" -ForegroundColor Yellow
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

# Frontend setup (optional)
Write-Host ""
$installFrontend = Read-Host "Install frontend dependencies (requires Node.js)? (y/n)"
if ($installFrontend -eq "y") {
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Blue
        Push-Location frontend
        npm install
        Pop-Location
        Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠ npm not found, skipping frontend setup" -ForegroundColor Yellow
    }
}

# Summary
Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Blue
Write-Host "1. Edit .env and add your API keys" -ForegroundColor White
Write-Host "2. Start the application:" -ForegroundColor White
Write-Host ""
Write-Host "   python start_simple.py" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Or in VS Code: Press F5 to debug" -ForegroundColor White
Write-Host "4. Install browser extension from browser-extension/" -ForegroundColor White
Write-Host ""
Write-Host "Happy negotiating! 🎯" -ForegroundColor Green
Write-Host ""
pause
