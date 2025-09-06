# Simple Azure Key Vault Setup Script for Pathfinity
# Run this script in PowerShell as Administrator

Write-Host "=== Pathfinity Azure Key Vault Setup ===" -ForegroundColor Cyan

# Check if Azure CLI is installed
Write-Host "Checking Azure CLI installation..." -ForegroundColor Yellow
try {
    az --version | Out-Null
    Write-Host "Azure CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "Azure CLI not found. Please install from: https://aka.ms/installazurecliwindows" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Login to Azure
Write-Host "Logging into Azure..." -ForegroundColor Yellow
az login

# Set variables
$resourceGroup = "pathfinity-rg"
$keyVaultName = "pathfinity-dev-kv"
$location = "eastus"

# Create Resource Group
Write-Host "Creating resource group..." -ForegroundColor Yellow
az group create --name $resourceGroup --location $location --output table

# Create Key Vault
Write-Host "Creating Key Vault..." -ForegroundColor Yellow
az keyvault create --name $keyVaultName --resource-group $resourceGroup --location $location --output table

# Get current user's email
$currentUser = az account show --query user.name -o tsv

# Grant access to current user
Write-Host "Granting access to $currentUser..." -ForegroundColor Yellow
az keyvault set-policy --name $keyVaultName --upn $currentUser --secret-permissions get list set delete backup restore recover purge

Write-Host "=== Adding Secrets to Key Vault ===" -ForegroundColor Cyan

# Helper function to add secrets safely
function AddSecret($name, $description) {
    Write-Host "Adding secret: $name" -ForegroundColor Yellow
    Write-Host "Description: $description" -ForegroundColor Gray
    
    $secret = Read-Host "Enter value (or press Enter to skip)" -AsSecureString
    
    if ($secret.Length -gt 0) {
        $plainText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret))
        az keyvault secret set --vault-name $keyVaultName --name $name --value $plainText --output none
        Write-Host "✓ Secret added successfully" -ForegroundColor Green
    } else {
        Write-Host "- Skipped" -ForegroundColor Yellow
    }
}

# Add secrets one by one
AddSecret "azure-openai-key" "Main Azure OpenAI API Key"
AddSecret "azure-cognitive-services-key" "Cognitive Services API Key" 
AddSecret "azure-speech-key" "Speech Services API Key"
AddSecret "azure-translator-key" "Translator API Key"
AddSecret "azure-dalle-key" "DALL-E API Key"

# Add endpoints configuration
Write-Host "Adding endpoints configuration..." -ForegroundColor Yellow
$endpoints = '{"openAI":"https://pathfinity-ai-foundry.openai.azure.com/","aiFoundry":"https://pathfinity-ai-foundry.services.ai.azure.com/","deployments":{"gpt4o":"gpt-4o","gpt4":"gpt-4","gpt35":"gpt-35-turbo","dalle":"dall-e-3"}}'
az keyvault secret set --vault-name $keyVaultName --name "azure-endpoints-config" --value $endpoints --output none
Write-Host "✓ Endpoints configuration added" -ForegroundColor Green

# Create .env.development file
Write-Host "Creating .env.development file..." -ForegroundColor Yellow
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

$envPath = ".env.development"
$envContent | Out-File -FilePath $envPath -Encoding utf8
Write-Host "✓ Updated .env.development" -ForegroundColor Green

# Install npm packages
Write-Host "Installing required NPM packages..." -ForegroundColor Yellow
npm install @azure/keyvault-secrets @azure/identity

Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host "Your Azure Key Vault is ready!" -ForegroundColor Cyan
Write-Host "Key Vault Name: $keyVaultName" -ForegroundColor Yellow
Write-Host "" 
Write-Host "To start development with Key Vault:" -ForegroundColor Cyan
Write-Host "  npm run dev:keyvault" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: Delete your .env file with exposed keys!" -ForegroundColor Red
Write-Host "Run: Remove-Item .env" -ForegroundColor Yellow

$null = Read-Host "Press Enter to exit"