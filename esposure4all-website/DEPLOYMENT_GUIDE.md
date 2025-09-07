# Esposure4All.org Deployment Guide

## 🚀 Step-by-Step Deployment Instructions

### Phase 1: Git Repository Setup

1. **Initialize Local Repository**
   ```bash
   cd /path/to/esposure4all-website
   git init
   git add .
   git commit -m "Initial commit: Esposure4All nonprofit website"
   ```

2. **Create GitHub Repository**
   - Go to https://github.com/new
   - Repository name: `esposure4all-website`
   - Description: "Official website for Esposure4All 501(c)3 nonprofit foundation"
   - Set to Public (or Private if preferred)
   - Don't initialize with README (we already have one)
   - Click "Create repository"

3. **Connect and Push**
   ```bash
   git remote add origin https://github.com/[your-username]/esposure4all-website.git
   git branch -M main
   git push -u origin main
   ```

### Phase 2: Netlify Setup

1. **Create Netlify Account** (if needed)
   - Visit https://app.netlify.com/signup
   - Sign up with GitHub for easier integration

2. **Deploy from Git**
   - Click "New site from Git"
   - Choose GitHub
   - Authorize Netlify to access your repositories
   - Select `esposure4all-website` repository
   - Build settings:
     - Branch to deploy: `main`
     - Build command: (leave empty)
     - Publish directory: `/`
   - Click "Deploy site"

3. **Initial Deployment**
   - Wait for deployment (usually < 1 minute)
   - You'll get a URL like: `amazing-newton-123456.netlify.app`
   - Click the URL to verify site is live

### Phase 3: Domain Configuration at GoDaddy

1. **Access Domain Settings**
   - Log into GoDaddy account
   - Go to "My Products"
   - Find Esposure4All.org
   - Click "DNS" or "Manage"

2. **Option A: Point to Netlify (Recommended)**
   - Delete existing A records and CNAME records
   - Add these DNS records:
     ```
     Type: A     Name: @    Value: 75.2.60.5
     Type: CNAME Name: www  Value: [your-site-name].netlify.app
     ```

3. **Option B: Transfer DNS to Netlify**
   - In Netlify: Go to Domain settings
   - Click "Add custom domain"
   - Enter: Esposure4All.org
   - Netlify will provide nameservers:
     ```
     dns1.p01.nsone.net
     dns2.p01.nsone.net
     dns3.p01.nsone.net
     dns4.p01.nsone.net
     ```
   - In GoDaddy: Change nameservers to Netlify's

### Phase 4: Configure Domain in Netlify

1. **Add Custom Domain**
   - In Netlify dashboard, go to "Domain settings"
   - Click "Add custom domain"
   - Enter: `Esposure4All.org`
   - Click "Verify"

2. **Add Domain Alias**
   - Add alias: `www.Esposure4All.org`
   - This ensures both versions work

3. **Enable HTTPS**
   - Scroll to "HTTPS"
   - Click "Verify DNS configuration"
   - Once verified, click "Provision certificate"
   - Wait for Let's Encrypt certificate (usually 5-10 minutes)

### Phase 5: Verification

1. **DNS Propagation Check**
   - Visit https://www.whatsmydns.net/
   - Enter Esposure4All.org
   - Check A record propagation globally
   - Full propagation: 24-48 hours

2. **Test All Variations**
   - http://Esposure4All.org (should redirect to HTTPS)
   - https://Esposure4All.org (primary)
   - http://www.Esposure4All.org (should redirect)
   - https://www.Esposure4All.org (should redirect to non-www)

3. **Performance Check**
   - Run Google PageSpeed Insights
   - Test on mobile devices
   - Verify all links work

### Phase 6: Post-Deployment

1. **Update Repository**
   ```bash
   git add DEPLOYMENT_GUIDE.md
   git commit -m "Add deployment documentation"
   git push
   ```

2. **Set Up Continuous Deployment**
   - Any push to `main` branch auto-deploys
   - Consider branch protection for production

3. **Monitor Site**
   - Check Netlify dashboard for build status
   - Set up uptime monitoring (optional)
   - Configure analytics (Google Analytics, etc.)

## 🔧 Troubleshooting

### Common Issues

1. **Domain Not Working**
   - Check DNS propagation status
   - Verify DNS records in GoDaddy
   - Ensure Netlify domain is verified

2. **SSL Certificate Error**
   - Re-provision certificate in Netlify
   - Check domain configuration
   - Wait for propagation

3. **404 Errors**
   - Check file paths are correct
   - Verify index.html is in root
   - Check Netlify publish directory

### Support Contacts

- **Netlify Support**: https://www.netlify.com/support/
- **GoDaddy Support**: 24/7 phone support
- **GitHub Issues**: Create issue in repository

## 📋 Checklist

- [ ] Git repository created and pushed
- [ ] Netlify account created
- [ ] Site deployed to Netlify
- [ ] Domain configured at GoDaddy
- [ ] Custom domain added to Netlify
- [ ] HTTPS certificate provisioned
- [ ] All URL variations tested
- [ ] Performance verified
- [ ] Team notified of new URL

## 🎉 Launch Announcement Template

```
Subject: Esposure4All.org is Live!

We're excited to announce that our new website is now live at Esposure4All.org!

The site showcases:
- Our mission to empower youth through gaming and education
- Partnership with Microsoft Philanthropies
- The Esposure ecosystem (E4A, Esposure Inc., and Pathfinity)
- Ways to get involved through donations, partnerships, and volunteering

Please share with your networks and help us spread the word about our mission to increase access to education for disenfranchised youth.

Visit us at: https://Esposure4All.org
```

---

**Deployment completed by**: ________________  
**Date**: ________________  
**Notes**: ________________