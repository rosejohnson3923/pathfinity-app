#!/bin/bash

# Azure Key Vault Setup Script for Pathfinity
# Run this script in your terminal

echo -e "\033[36m=== Pathfinity Azure Key Vault Setup ===\033[0m"

# Check if Azure CLI is installed
echo -e "\n\033[33mChecking Azure CLI installation...\033[0m"
if command -v az &> /dev/null; then
    echo -e "\033[32mAzure CLI is installed\033[0m"
else
    echo -e "\033[31mAzure CLI not found. Please install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli\033[0m"
    echo -e "\033[33mFor macOS: brew install azure-cli\033[0m"
    echo -e "\033[33mFor Ubuntu/Debian: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash\033[0m"
    exit 1
fi

# Login to Azure
echo -e "\n\033[33mLogging into Azure...\033[0m"
az login

# Set variables
RESOURCE_GROUP="pathfinity-rg"
KEY_VAULT_NAME="pathfinity-dev-kv"
LOCATION="eastus"

# Check if user wants to use a different name
echo -e "\n\033[36mKey Vault name: $KEY_VAULT_NAME\033[0m"
read -p "Press Enter to use this name or type a custom name: " custom_name
if [ ! -z "$custom_name" ]; then
    KEY_VAULT_NAME="$custom_name"
fi

# Create Resource Group
echo -e "\n\033[33mCreating resource group '$RESOURCE_GROUP'...\033[0m"
az group create --name $RESOURCE_GROUP --location $LOCATION --output table

# Create Key Vault
echo -e "\n\033[33mCreating Key Vault '$KEY_VAULT_NAME'...\033[0m"
if az keyvault create \
    --name $KEY_VAULT_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --output json; then
    echo -e "\033[32mKey Vault created successfully!\033[0m"
else
    echo -e "\033[31mFailed to create Key Vault\033[0m"
    exit 1
fi

# Get current user's email
CURRENT_USER=$(az account show --query user.name -o tsv)

# Grant access to current user
echo -e "\n\033[33mGranting access to $CURRENT_USER...\033[0m"
az keyvault set-policy \
    --name $KEY_VAULT_NAME \
    --upn $CURRENT_USER \
    --secret-permissions get list set delete backup restore recover purge

echo -e "\n\033[36m=== Adding Secrets to Key Vault ===\033[0m"
echo -e "\033[33mI'll help you add your Azure AI secrets securely.\033[0m"
echo -e "\033[32mYour secrets will NOT be displayed or logged.\033[0m"

# Function to add secret
add_secret() {
    local secret_name=$1
    local description=$2
    
    echo -e "\n\033[33mAdding secret: $secret_name\033[0m"
    echo -e "\033[90mDescription: $description\033[0m"
    
    read -s -p "Enter value (or press Enter to skip): " secret_value
    echo ""
    
    if [ ! -z "$secret_value" ]; then
        az keyvault secret set \
            --vault-name $KEY_VAULT_NAME \
            --name $secret_name \
            --value "$secret_value" \
            --output none
        
        echo -e "\033[32m✓ Secret '$secret_name' added successfully\033[0m"
    else
        echo -e "\033[33m- Skipped '$secret_name'\033[0m"
    fi
}

# Add all required secrets
add_secret "azure-openai-key" "Main Azure OpenAI API Key"
add_secret "azure-cognitive-services-key" "Cognitive Services API Key"
add_secret "azure-speech-key" "Speech Services API Key"
add_secret "azure-translator-key" "Translator API Key"
add_secret "azure-dalle-key" "DALL-E API Key"

# Add endpoints configuration
echo -e "\n\033[33mAdding endpoints configuration...\033[0m"
ENDPOINTS_CONFIG='{
  "openAI": "https://pathfinity-ai-foundry.openai.azure.com/",
  "aiFoundry": "https://pathfinity-ai-foundry.services.ai.azure.com/",
  "deployments": {
    "gpt4o": "gpt-4o",
    "gpt4": "gpt-4",
    "gpt35": "gpt-35-turbo",
    "dalle": "dall-e-3"
  }
}'

az keyvault secret set \
    --vault-name $KEY_VAULT_NAME \
    --name "azure-endpoints-config" \
    --value "$ENDPOINTS_CONFIG" \
    --output none

echo -e "\033[32m✓ Endpoints configuration added\033[0m"

# Update local environment file
echo -e "\n\033[36m=== Updating Local Configuration ===\033[0m"

cat > .env.development << EOF
# Development Environment Configuration
# This file is safe to commit - no secrets here!

# Enable Azure Key Vault for development
VITE_USE_KEY_VAULT=true
VITE_AZURE_KEY_VAULT_NAME=$KEY_VAULT_NAME

# Public endpoints (safe to commit)
VITE_AZURE_OPENAI_ENDPOINT=https://pathfinity-ai-foundry.openai.azure.com/
VITE_AZURE_AI_FOUNDRY_ENDPOINT=https://pathfinity-ai-foundry.services.ai.azure.com/

# Supabase public config (safe to commit)
VITE_SUPABASE_URL=https://zohdmprtfyijneqnwjsu.supabase.co

# Feature flags
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_DEBUG_LOGGING=true
EOF

echo -e "\033[32m✓ Updated .env.development\033[0m"

# Install npm packages
echo -e "\n\033[36m=== Installing Required NPM Packages ===\033[0m"
npm install @azure/keyvault-secrets @azure/identity

echo -e "\n\033[32m=== Setup Complete! ===\033[0m"
echo -e "\n\033[36mYour Azure Key Vault is ready to use!\033[0m"
echo -e "\033[33mKey Vault Name: $KEY_VAULT_NAME\033[0m"
echo -e "\n\033[36mTo start development with Key Vault:\033[0m"
echo -e "\033[33m  npm run dev:keyvault\033[0m"
echo -e "\n\033[36mTo verify your setup:\033[0m"
echo -e "\033[90m  1. Check Key Vault in Azure Portal: https://portal.azure.com\033[0m"
echo -e "\033[90m  2. Look for resource group: $RESOURCE_GROUP\033[0m"
echo -e "\033[90m  3. Key Vault: $KEY_VAULT_NAME\033[0m"

echo -e "\n\033[31mIMPORTANT: Delete your .env file with exposed keys!\033[0m"
echo -e "\033[33mRun: rm .env\033[0m"

read -p $'\nPress Enter to exit'