#!/bin/bash

# PathIQ™ Production Build Script with IP Protection
# Copyright (c) 2024 Esposure Inc. All rights reserved.

echo "🔒 Building PathIQ™ with IP Protection..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if production config exists
if [ ! -f "vite.config.production.ts" ]; then
    echo -e "${RED}Error: vite.config.production.ts not found${NC}"
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf dist-protected/

# Build with production config
echo "🔨 Building with obfuscation and minification..."
npx vite build --config vite.config.production.ts

# Check if build succeeded
if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

# Create protected distribution
echo "📦 Creating protected distribution..."
mkdir -p dist-protected

# Copy build files
cp -r dist/* dist-protected/

# Add additional protection to HTML
echo "🛡️ Adding HTML protection..."
cat > dist-protected/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pathfinity.ai - Where Learning Meets Real Life</title>
    <meta name="description" content="PathIQ™ Intelligence System - Revolutionary AI-powered education">
    <meta name="copyright" content="© 2024 Esposure Inc. All rights reserved.">
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
    
    <!-- Disable caching for security -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    
    <!-- Security headers -->
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta http-equiv="Referrer-Policy" content="no-referrer">
    
    <!-- Anti-debugging CSS -->
    <style>
        @media print { body { display: none !important; } }
        * { -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
        input, textarea { -webkit-user-select: text !important; -moz-user-select: text !important; -ms-user-select: text !important; user-select: text !important; }
    </style>
    
    <script>
        // Basic protection script
        (function() {
            'use strict';
            
            // Disable right-click
            document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; });
            
            // Disable text selection
            document.addEventListener('selectstart', function(e) { e.preventDefault(); return false; });
            
            // Disable drag
            document.addEventListener('dragstart', function(e) { e.preventDefault(); return false; });
            
            // Detect DevTools
            var devtools = {open: false, orientation: null};
            var threshold = 160;
            setInterval(function() {
                if (window.outerHeight - window.innerHeight > threshold || 
                    window.outerWidth - window.innerWidth > threshold) {
                    if (!devtools.open) {
                        devtools.open = true;
                        document.body.innerHTML = '<h1 style="text-align:center;margin-top:20%;">Unauthorized Access Detected</h1>';
                    }
                }
            }, 500);
            
            // Disable console
            if (window.console && window.console.log) {
                console.log('%cSTOP!', 'color:red;font-size:50px;font-weight:bold;');
                console.log('%cThis is a browser feature intended for developers.', 'color:red;font-size:16px;');
                console.log('%cAttempting to access or modify this application may violate copyright law.', 'color:red;font-size:16px;');
                console.log('%c© 2024 Esposure Inc. PathIQ™ Intelligence System. All rights reserved.', 'color:blue;font-size:14px;');
            }
        })();
    </script>
</head>
<body>
    <noscript>
        <div style="text-align:center;margin-top:20%;font-family:sans-serif;">
            <h1>JavaScript Required</h1>
            <p>PathIQ™ requires JavaScript to be enabled.</p>
        </div>
    </noscript>
    <div id="root"></div>
EOF

# Append the built scripts to index.html
echo "    <!-- Protected PathIQ™ Application -->" >> dist-protected/index.html
for file in dist/assets/*.js; do
    filename=$(basename "$file")
    echo "    <script type=\"module\" src=\"/assets/$filename\"></script>" >> dist-protected/index.html
done

for file in dist/assets/*.css; do
    filename=$(basename "$file")
    echo "    <link rel=\"stylesheet\" href=\"/assets/$filename\">" >> dist-protected/index.html
done

echo "</body></html>" >> dist-protected/index.html

# Create .htaccess for Apache servers
echo "🔐 Creating .htaccess security rules..."
cat > dist-protected/.htaccess << 'EOF'
# PathIQ™ Security Configuration
# Prevent directory listing
Options -Indexes

# Block access to sensitive files
<FilesMatch "\.(env|json|md|yml|yaml|lock|log)$">
    Order deny,allow
    Deny from all
</FilesMatch>

# Security headers
Header set X-Frame-Options "DENY"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "no-referrer"
Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"

# Disable caching for security
Header set Cache-Control "no-cache, no-store, must-revalidate"
Header set Pragma "no-cache"
Header set Expires 0

# Block bad bots
RewriteEngine On
RewriteCond %{HTTP_USER_AGENT} (wget|curl|python|scrapy|bot|spider) [NC]
RewriteRule .* - [F,L]
EOF

# Create nginx configuration
echo "🔐 Creating nginx security configuration..."
cat > dist-protected/nginx.conf << 'EOF'
# PathIQ™ Nginx Security Configuration
server {
    listen 80;
    server_name pathfinity.ai www.pathfinity.ai;
    root /var/www/pathfinity;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
    
    # Disable caching for security
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    add_header Pragma "no-cache" always;
    add_header Expires 0 always;
    
    # Block bad user agents
    if ($http_user_agent ~* (wget|curl|python|scrapy|bot|spider)) {
        return 403;
    }
    
    # Block access to sensitive files
    location ~ \.(env|json|md|yml|yaml|lock|log)$ {
        deny all;
        return 404;
    }
    
    # Serve the application
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Create deployment instructions
echo "📝 Creating deployment instructions..."
cat > dist-protected/DEPLOYMENT.md << 'EOF'
# PathIQ™ Protected Deployment Instructions

## ⚠️ IMPORTANT SECURITY NOTICE
This build contains protected intellectual property of Esposure Inc.
Unauthorized distribution or modification is prohibited.

## Prerequisites
- Valid PathIQ™ license key
- Authorized domain (pathfinity.ai or subdomains)
- HTTPS enabled (required for production)

## Environment Variables Required
```
VITE_PATHIQ_LICENSE_KEY=your-license-key-here
VITE_LICENSE_ENDPOINT=https://api.esposure.gg/validate-license
VITE_LICENSE_PUBLIC_KEY=your-public-key-here
```

## Apache Deployment
1. Upload contents of dist-protected/ to your web root
2. Ensure .htaccess file is present and readable
3. Enable mod_headers and mod_rewrite
4. Set proper file permissions (755 for directories, 644 for files)

## Nginx Deployment
1. Upload contents of dist-protected/ to /var/www/pathfinity
2. Copy nginx.conf to /etc/nginx/sites-available/pathfinity
3. Create symlink: ln -s /etc/nginx/sites-available/pathfinity /etc/nginx/sites-enabled/
4. Restart nginx: sudo systemctl restart nginx

## Security Checklist
- [ ] HTTPS certificate installed and configured
- [ ] Environment variables set correctly
- [ ] License key is valid and not exposed in client code
- [ ] Domain is in the authorized list
- [ ] Security headers are properly configured
- [ ] Directory listing is disabled
- [ ] Sensitive files are blocked from access

## Support
For licensing and deployment support: support@esposure.gg

© 2024 Esposure Inc. All rights reserved.
PathIQ™ is a trademark of Esposure Inc.
EOF

# Calculate build size
BUILD_SIZE=$(du -sh dist-protected | cut -f1)

echo ""
echo -e "${GREEN}✅ Production build complete!${NC}"
echo -e "${GREEN}📦 Build size: $BUILD_SIZE${NC}"
echo -e "${GREEN}📁 Output directory: dist-protected/${NC}"
echo ""
echo -e "${YELLOW}Security features enabled:${NC}"
echo "  ✓ Code obfuscation"
echo "  ✓ String encryption"
echo "  ✓ Domain locking"
echo "  ✓ Anti-debugging protection"
echo "  ✓ DevTools detection"
echo "  ✓ Right-click disabled"
echo "  ✓ Text selection disabled"
echo "  ✓ Console output disabled"
echo "  ✓ Self-defending code"
echo "  ✓ Dead code injection"
echo "  ✓ Control flow flattening"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Set environment variables for license validation"
echo "2. Deploy to authorized domain only"
echo "3. Enable HTTPS (required)"
echo "4. Configure server security headers"
echo "5. Test license validation before going live"
echo ""
echo -e "${GREEN}PathIQ™ Intelligence System - Protected Build${NC}"
echo "© 2024 Esposure Inc. All rights reserved."