# Azure CLI Installation Script for Windows
# Run this script in PowerShell as Administrator

Write-Host "=== Installing Azure CLI on Windows ===" -ForegroundColor Cyan

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires Administrator privileges." -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Azure CLI is already installed
try {
    az --version | Out-Null
    Write-Host "Azure CLI is already installed!" -ForegroundColor Green
    az --version | Select-String "azure-cli" | Write-Host -ForegroundColor Cyan
    Read-Host "Press Enter to continue"
    exit 0
} catch {
    Write-Host "Azure CLI not found. Installing..." -ForegroundColor Yellow
}

# Try winget first (fastest method)
Write-Host "Trying installation via Windows Package Manager (winget)..." -ForegroundColor Yellow
try {
    winget install Microsoft.AzureCLI --silent
    Write-Host "Azure CLI installed successfully via winget!" -ForegroundColor Green
    Write-Host "Please restart PowerShell and run the Key Vault setup script." -ForegroundColor Cyan
    Read-Host "Press Enter to exit"
    exit 0
} catch {
    Write-Host "Winget installation failed. Trying direct download..." -ForegroundColor Yellow
}

# Download and install MSI directly
$downloadUrl = "https://aka.ms/installazurecliwindows"
$installerPath = "$env:TEMP\AzureCLI.msi"

Write-Host "Downloading Azure CLI installer..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "Download completed!" -ForegroundColor Green
} catch {
    Write-Host "Download failed. Please install manually from: $downloadUrl" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install the MSI
Write-Host "Installing Azure CLI..." -ForegroundColor Yellow
try {
    Start-Process msiexec.exe -Wait -ArgumentList "/i `"$installerPath`" /quiet /norestart"
    Write-Host "Azure CLI installed successfully!" -ForegroundColor Green
    
    # Clean up
    Remove-Item $installerPath -Force
    
    Write-Host "Installation complete!" -ForegroundColor Green
    Write-Host "Please restart PowerShell and run:" -ForegroundColor Cyan
    Write-Host "  .\scripts\keyvault-setup-simple.ps1" -ForegroundColor Yellow
    
} catch {
    Write-Host "Installation failed. Please install manually from: $downloadUrl" -ForegroundColor Red
}

Read-Host "Press Enter to exit"