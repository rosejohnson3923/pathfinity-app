# Manual Key Vault Setup with Provider Registration
Write-Host "=== Manual Key Vault Setup ===" -ForegroundColor Cyan

# Step 1: Register Key Vault provider
Write-Host "Registering Key Vault provider..." -ForegroundColor Yellow
az provider register --namespace Microsoft.KeyVault

# Wait for registration
Write-Host "Waiting for provider registration..." -ForegroundColor Yellow
do {
    $status = az provider show --namespace Microsoft.KeyVault --query "registrationState" -o tsv
    Write-Host "Status: $status" -ForegroundColor Gray
    if ($status -ne "Registered") {
        Start-Sleep -Seconds 10
    }
} while ($status -ne "Registered")

Write-Host "Key Vault provider registered successfully!" -ForegroundColor Green

# Step 2: List existing resource groups
Write-Host "Your existing resource groups:" -ForegroundColor Cyan
az group list --query "[].name" -o table

# Step 3: Ask which resource group to use
$useExisting = Read-Host "Do you want to use an existing resource group? (y/n)"
if ($useExisting -eq "y") {
    $resourceGroup = Read-Host "Enter the resource group name"
} else {
    $resourceGroup = "pathfinity-rg"
    Write-Host "Creating new resource group: $resourceGroup" -ForegroundColor Yellow
    az group create --name $resourceGroup --location eastus --output table
}

# Step 4: Create Key Vault with unique name
$randomSuffix = Get-Random -Minimum 1000 -Maximum 9999
$keyVaultName = "pathfinity-kv-$randomSuffix"

Write-Host "Creating Key Vault: $keyVaultName" -ForegroundColor Yellow
az keyvault create --name $keyVaultName --resource-group $resourceGroup --location eastus --output table

# Step 5: Grant access
$currentUser = az account show --query user.name -o tsv
Write-Host "Granting access to: $currentUser" -ForegroundColor Yellow
az keyvault set-policy --name $keyVaultName --upn $currentUser --secret-permissions get list set delete backup restore recover purge

Write-Host "Key Vault setup complete!" -ForegroundColor Green
Write-Host "Key Vault Name: $keyVaultName" -ForegroundColor Cyan
Write-Host "Resource Group: $resourceGroup" -ForegroundColor Cyan

# Update .env.development
$envContent = @"
# Development Environment Configuration
VITE_USE_KEY_VAULT=true
VITE_AZURE_KEY_VAULT_NAME=$keyVaultName

# Public endpoints
VITE_AZURE_OPENAI_ENDPOINT=https://pathfinity-ai-foundry.openai.azure.com/
VITE_AZURE_AI_FOUNDRY_ENDPOINT=https://pathfinity-ai-foundry.services.ai.azure.com/

# Supabase config
VITE_SUPABASE_URL=https://zohdmprtfyijneqnwjsu.supabase.co

# Feature flags
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_DEBUG_LOGGING=true
"@

$envContent | Out-File -FilePath ".env.development" -Encoding utf8
Write-Host "Updated .env.development with Key Vault name: $keyVaultName" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Manually add your secrets to Key Vault using Azure Portal" -ForegroundColor Yellow
Write-Host "2. Or run these commands to add secrets:" -ForegroundColor Yellow
Write-Host "   az keyvault secret set --vault-name $keyVaultName --name 'azure-openai-key' --value 'YOUR_KEY'" -ForegroundColor Gray
Write-Host "3. Install NPM packages: npm install @azure/keyvault-secrets @azure/identity" -ForegroundColor Yellow
Write-Host "4. Delete your .env file: Remove-Item .env" -ForegroundColor Yellow

Read-Host "Press Enter to continue"