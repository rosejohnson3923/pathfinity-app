# Azure Key Vault Setup Script for Pathfinity
# Run this script in PowerShell as Administrator

Write-Host "=== Pathfinity Azure Key Vault Setup ===" -ForegroundColor Cyan

# Check if Azure CLI is installed
Write-Host "`nChecking Azure CLI installation..." -ForegroundColor Yellow
try {
    $azVersion = az --version
    Write-Host "Azure CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "Azure CLI not found. Please install from: https://aka.ms/installazurecliwindows" -ForegroundColor Red
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    exit 1
}

# Login to Azure
Write-Host "`nLogging into Azure..." -ForegroundColor Yellow
az login

# Set variables
$resourceGroup = "pathfinity-rg"
$keyVaultName = "pathfinity-dev-kv"
$location = "eastus"

# Check if user wants to use a different name
Write-Host "`nKey Vault name: $keyVaultName" -ForegroundColor Cyan
$customName = Read-Host "Press Enter to use this name or type a custom name"
if ($customName) {
    $keyVaultName = $customName
}

# Create Resource Group
Write-Host "`nCreating resource group '$resourceGroup'..." -ForegroundColor Yellow
az group create --name $resourceGroup --location $location --output table

# Create Key Vault
Write-Host "`nCreating Key Vault '$keyVaultName'..." -ForegroundColor Yellow
$kvResult = az keyvault create `
    --name $keyVaultName `
    --resource-group $resourceGroup `
    --location $location `
    --output json | ConvertFrom-Json

if ($kvResult) {
    Write-Host "Key Vault created successfully!" -ForegroundColor Green
} else {
    Write-Host "Failed to create Key Vault" -ForegroundColor Red
    exit 1
}

# Get current user's email
$currentUser = az account show --query user.name -o tsv

# Grant access to current user
Write-Host "`nGranting access to $currentUser..." -ForegroundColor Yellow
az keyvault set-policy `
    --name $keyVaultName `
    --upn $currentUser `
    --secret-permissions get list set delete backup restore recover purge

Write-Host "`n=== Adding Secrets to Key Vault ===" -ForegroundColor Cyan
Write-Host "I'll help you add your Azure AI secrets securely." -ForegroundColor Yellow
Write-Host "Your secrets will NOT be displayed or logged." -ForegroundColor Green

# Function to add secret
function Add-Secret {
    param (
        [string]$SecretName,
        [string]$Description
    )
    
    Write-Host "`nAdding secret: $SecretName" -ForegroundColor Yellow
    Write-Host "Description: $Description" -ForegroundColor Gray
    
    $currentValue = Read-Host "Enter value (or press Enter to skip)" -AsSecureString
    
    if ($currentValue.Length -gt 0) {
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($currentValue)
        $plainText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        
        az keyvault secret set `
            --vault-name $keyVaultName `
            --name $SecretName `
            --value $plainText `
            --output none
        
        Write-Host "✓ Secret '$SecretName' added successfully" -ForegroundColor Green
        
        # Clear the plain text from memory
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    } else {
        Write-Host "- Skipped '$SecretName'" -ForegroundColor Yellow
    }
}

# Add all required secrets
Add-Secret "azure-openai-key" "Main Azure OpenAI API Key"
Add-Secret "azure-cognitive-services-key" "Cognitive Services API Key"
Add-Secret "azure-speech-key" "Speech Services API Key"
Add-Secret "azure-translator-key" "Translator API Key"
Add-Secret "azure-dalle-key" "DALL-E API Key"

# Add endpoints configuration
Write-Host "`nAdding endpoints configuration..." -ForegroundColor Yellow
$endpointsConfig = @{
    openAI = "https://pathfinity-ai-foundry.openai.azure.com/"
    aiFoundry = "https://pathfinity-ai-foundry.services.ai.azure.com/"
    deployments = @{
        gpt4o = "gpt-4o"
        gpt4 = "gpt-4"
        gpt35 = "gpt-35-turbo"
        dalle = "dall-e-3"
    }
} | ConvertTo-Json -Compress

az keyvault secret set `
    --vault-name $keyVaultName `
    --name "azure-endpoints-config" `
    --value $endpointsConfig `
    --output none

Write-Host "✓ Endpoints configuration added" -ForegroundColor Green

# Update local environment file
Write-Host "`n=== Updating Local Configuration ===" -ForegroundColor Cyan

$envContent = @"
# Development Environment Configuration
# This file is safe to commit - no secrets here!

# Enable Azure Key Vault for development
VITE_USE_KEY_VAULT=true
VITE_AZURE_KEY_VAULT_NAME=$keyVaultName

# Public endpoints (safe to commit)
VITE_AZURE_OPENAI_ENDPOINT=https://pathfinity-ai-foundry.openai.azure.com/
VITE_AZURE_AI_FOUNDRY_ENDPOINT=https://pathfinity-ai-foundry.services.ai.azure.com/

# Supabase public config (safe to commit)
VITE_SUPABASE_URL=https://zohdmprtfyijneqnwjsu.supabase.co

# Feature flags
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_DEBUG_LOGGING=true
"@

$envPath = Join-Path $PSScriptRoot ".." ".env.development"
$envContent | Out-File -FilePath $envPath -Encoding utf8
Write-Host "✓ Updated .env.development" -ForegroundColor Green

# Install npm packages
Write-Host "`n=== Installing Required NPM Packages ===" -ForegroundColor Cyan
Set-Location (Join-Path $PSScriptRoot "..")
npm install @azure/keyvault-secrets @azure/identity

Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "`nYour Azure Key Vault is ready to use!" -ForegroundColor Cyan
Write-Host "Key Vault Name: $keyVaultName" -ForegroundColor Yellow
Write-Host "`nTo start development with Key Vault:" -ForegroundColor Cyan
Write-Host "  npm run dev:keyvault" -ForegroundColor Yellow
Write-Host "`nTo verify your setup:" -ForegroundColor Cyan
Write-Host "  1. Check Key Vault in Azure Portal: https://portal.azure.com" -ForegroundColor Gray
Write-Host "  2. Look for resource group: $resourceGroup" -ForegroundColor Gray
Write-Host "  3. Key Vault: $keyVaultName" -ForegroundColor Gray

Write-Host "`nIMPORTANT: Delete your .env file with exposed keys!" -ForegroundColor Red
Write-Host "Run: Remove-Item .env" -ForegroundColor Yellow

Read-Host "Press Enter to exit"