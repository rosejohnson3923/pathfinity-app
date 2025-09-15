// Stub for @azure/identity in browser environment
// Azure Identity SDK is Node.js only and cannot run in browser

export class DefaultAzureCredential {
  constructor() {
    console.warn('DefaultAzureCredential is not available in browser environment');
  }
}

// Export other credentials as stubs to prevent import errors
export class ClientSecretCredential {
  constructor() {
    console.warn('ClientSecretCredential is not available in browser environment');
  }
}

export class ChainedTokenCredential {
  constructor() {
    console.warn('ChainedTokenCredential is not available in browser environment');
  }
}

export class EnvironmentCredential {
  constructor() {
    console.warn('EnvironmentCredential is not available in browser environment');
  }
}

export class ClientCertificateCredential {
  constructor() {
    console.warn('ClientCertificateCredential is not available in browser environment');
  }
}

export class ClientAssertionCredential {
  constructor() {
    console.warn('ClientAssertionCredential is not available in browser environment');
  }
}

export class AzureCliCredential {
  constructor() {
    console.warn('AzureCliCredential is not available in browser environment');
  }
}

export class AzureDeveloperCliCredential {
  constructor() {
    console.warn('AzureDeveloperCliCredential is not available in browser environment');
  }
}

export class InteractiveBrowserCredential {
  constructor() {
    console.warn('InteractiveBrowserCredential is not available in browser environment');
  }
}

export class ManagedIdentityCredential {
  constructor() {
    console.warn('ManagedIdentityCredential is not available in browser environment');
  }
}

export class DeviceCodeCredential {
  constructor() {
    console.warn('DeviceCodeCredential is not available in browser environment');
  }
}

export class AzurePipelinesCredential {
  constructor() {
    console.warn('AzurePipelinesCredential is not available in browser environment');
  }
}

export class AuthorizationCodeCredential {
  constructor() {
    console.warn('AuthorizationCodeCredential is not available in browser environment');
  }
}

export class AzurePowerShellCredential {
  constructor() {
    console.warn('AzurePowerShellCredential is not available in browser environment');
  }
}

export class UsernamePasswordCredential {
  constructor() {
    console.warn('UsernamePasswordCredential is not available in browser environment');
  }
}

export class VisualStudioCodeCredential {
  constructor() {
    console.warn('VisualStudioCodeCredential is not available in browser environment');
  }
}

export class OnBehalfOfCredential {
  constructor() {
    console.warn('OnBehalfOfCredential is not available in browser environment');
  }
}

// Export constants
export const AzureAuthorityHosts = {
  AzurePublicCloud: 'https://login.microsoftonline.com',
  AzureChina: 'https://login.chinacloudapi.cn',
  AzureGermany: 'https://login.microsoftonline.de',
  AzureUSGovernment: 'https://login.microsoftonline.us',
};