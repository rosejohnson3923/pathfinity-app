#!/bin/bash

# Azure CLI Installation Script for Kali Linux
echo -e "\033[36m=== Installing Azure CLI on Kali Linux ===\033[0m"

# Update package list
echo -e "\n\033[33mUpdating package list...\033[0m"
sudo apt-get update

# Install required dependencies
echo -e "\n\033[33mInstalling dependencies...\033[0m"
sudo apt-get install -y ca-certificates curl apt-transport-https lsb-release gnupg

# Download and install the Microsoft signing key
echo -e "\n\033[33mAdding Microsoft signing key...\033[0m"
curl -sL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/microsoft.gpg > /dev/null

# Add the Azure CLI software repository
echo -e "\n\033[33mAdding Azure CLI repository...\033[0m"
AZ_REPO=$(lsb_release -cs)
echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" | sudo tee /etc/apt/sources.list.d/azure-cli.list

# Update package list with the new repository
echo -e "\n\033[33mUpdating package list with Azure CLI repository...\033[0m"
sudo apt-get update

# Install Azure CLI
echo -e "\n\033[33mInstalling Azure CLI...\033[0m"
sudo apt-get install -y azure-cli

# Verify installation
echo -e "\n\033[33mVerifying Azure CLI installation...\033[0m"
if command -v az &> /dev/null; then
    az_version=$(az --version | head -n 1)
    echo -e "\033[32m✓ Azure CLI installed successfully!\033[0m"
    echo -e "\033[36mVersion: $az_version\033[0m"
    echo -e "\n\033[33mYou can now run the Key Vault setup script:\033[0m"
    echo -e "\033[36m  ./scripts/setup-azure-keyvault.sh\033[0m"
else
    echo -e "\033[31m✗ Azure CLI installation failed\033[0m"
    echo -e "\033[33mTry the manual installation method below:\033[0m"
    echo -e "\033[36mcurl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash\033[0m"
fi