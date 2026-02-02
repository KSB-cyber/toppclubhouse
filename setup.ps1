n# TOPP Club House Project Setup Script
# This script installs Node.js and sets up the project

Write-Host "Setting up TOPP Club House project..." -ForegroundColor Green

# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
Write-Host "Execution policy set to RemoteSigned" -ForegroundColor Yellow

# Check if Chocolatey is installed
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Install Node.js via Chocolatey
Write-Host "Installing Node.js..." -ForegroundColor Yellow
choco install nodejs -y

# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Install project dependencies
Write-Host "Installing project dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Setup complete! You can now run 'npm run dev' to start the development server." -ForegroundColor Green