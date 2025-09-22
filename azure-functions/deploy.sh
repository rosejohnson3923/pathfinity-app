#!/bin/bash

# Azure Function Deployment Script for YouTube Proxy
# Deploys the YouTube proxy function to Azure Functions

echo "🚀 Deploying YouTube Proxy to Azure Functions"

# Configuration
RESOURCE_GROUP="pathfinity-rg"
FUNCTION_APP="pathfinity-functions"
STORAGE_ACCOUNT="pathfinitystorage"
LOCATION="eastus"
KEY_VAULT="pathfinity-kv-2823"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null
then
    echo "❌ Azure CLI is not installed. Please install it first."
    exit 1
fi

# Login to Azure if not already logged in
echo "📝 Checking Azure login status..."
if ! az account show &> /dev/null
then
    echo "Please login to Azure:"
    az login
fi

# Create Resource Group if it doesn't exist
echo "📦 Ensuring Resource Group exists..."
az group create --name $RESOURCE_GROUP --location $LOCATION 2>/dev/null

# Create Storage Account if it doesn't exist
echo "💾 Ensuring Storage Account exists..."
az storage account create \
    --name $STORAGE_ACCOUNT \
    --location $LOCATION \
    --resource-group $RESOURCE_GROUP \
    --sku Standard_LRS 2>/dev/null

# Create Function App if it doesn't exist
echo "⚡ Creating/Updating Function App..."
az functionapp create \
    --resource-group $RESOURCE_GROUP \
    --consumption-plan-location $LOCATION \
    --runtime node \
    --runtime-version 18 \
    --functions-version 4 \
    --name $FUNCTION_APP \
    --storage-account $STORAGE_ACCOUNT 2>/dev/null

# Configure Function App settings
echo "⚙️ Configuring Function App settings..."

# Add Key Vault reference for YouTube API key
az functionapp config appsettings set \
    --name $FUNCTION_APP \
    --resource-group $RESOURCE_GROUP \
    --settings \
    "KEY_VAULT_NAME=$KEY_VAULT" \
    "YOUTUBE_API_KEY=@Microsoft.KeyVault(SecretUri=https://$KEY_VAULT.vault.azure.net/secrets/youtube-api-key/)" \
    "YOUTUBE_ESPOSURE_API_KEY=@Microsoft.KeyVault(SecretUri=https://$KEY_VAULT.vault.azure.net/secrets/youtube-esposure-api-key/)" \
    "NODE_ENV=production"

# Enable CORS for your domains
echo "🌐 Configuring CORS..."
az functionapp cors add \
    --name $FUNCTION_APP \
    --resource-group $RESOURCE_GROUP \
    --allowed-origins \
    "http://localhost:5173" \
    "https://pathfinity.com" \
    "https://*.pathfinity.com" \
    "https://esposure.gg" \
    "https://*.esposure.gg"

# Grant Function App access to Key Vault
echo "🔐 Configuring Key Vault access..."

# Get Function App identity
IDENTITY=$(az functionapp identity assign \
    --name $FUNCTION_APP \
    --resource-group $RESOURCE_GROUP \
    --query principalId -o tsv)

# Grant access to Key Vault
az keyvault set-policy \
    --name $KEY_VAULT \
    --object-id $IDENTITY \
    --secret-permissions get list

# Build the function
echo "🔨 Building function..."
cd youtube-proxy
npm install
npm run build

# Deploy the function
echo "📤 Deploying function code..."
func azure functionapp publish $FUNCTION_APP

# Get the function URL
echo "✅ Deployment complete!"
echo ""
echo "Function URL:"
az functionapp function show \
    --name $FUNCTION_APP \
    --resource-group $RESOURCE_GROUP \
    --function-name youtube-proxy \
    --query invokeUrlTemplate -o tsv

echo ""
echo "📋 Next steps:"
echo "1. Add YouTube API keys to Key Vault:"
echo "   az keyvault secret set --vault-name $KEY_VAULT --name youtube-api-key --value YOUR_API_KEY"
echo "   az keyvault secret set --vault-name $KEY_VAULT --name youtube-esposure-api-key --value ESPOSURE_API_KEY"
echo ""
echo "2. Update .env file with:"
echo "   VITE_USE_AZURE_YOUTUBE_PROXY=true"
echo "   VITE_AZURE_YOUTUBE_PROXY_URL=<function-url-from-above>"
echo ""
echo "3. Test the proxy:"
echo "   curl <function-url>/health"