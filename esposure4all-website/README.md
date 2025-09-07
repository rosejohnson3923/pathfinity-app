# Esposure4All Website

Official website for Esposure4All, a 501(c)3 nonprofit foundation dedicated to empowering disenfranchised youth through gaming, esports, and education technology.

## 🎯 Project Overview

**Organization**: Esposure4All - 501(c)3 Nonprofit Foundation  
**Mission**: Increasing access to education and opportunities for disenfranchised youth using gaming & esports as a vehicle to create interest and enthusiasm for learning  
**Tech Stack**: HTML5, CSS3, JavaScript (Vanilla)  
**Domain**: Esposure4All.org  

## 🏗️ Architecture

### File Structure
```
/esposure4all-website/
├── index.html              # Main website file
├── assets/
│   ├── css/
│   │   └── styles.css      # Complete styling system
│   ├── js/
│   │   └── main.js         # Interactive functionality
│   └── images/             # Image assets (to be added)
├── content/                # Additional content pages (future)
└── README.md               # This file
```

### Design System

**Brand Colors**:
- Primary: `#6366F1` (Indigo - Nonprofit identity)
- Secondary: `#8B5CF6` (Purple - Pathfinity connection)
- Accent: `#10B981` (Green - Growth/Impact)
- Dark: `#111827` (Text/Headers)
- Light: `#F9FAFB` (Backgrounds)

**Typography**:
- Headers: Poppins (600 weight)
- Body: Inter (400-600 weights)

## 📱 Key Features

### Website Sections
1. **Hero**: Mission statement and key statistics
2. **Mission**: Core values and pillars
3. **Ecosystem**: Esposure4All, Esposure Inc., and Pathfinity relationship
4. **Partnerships**: Microsoft Philanthropies highlight
5. **Pathfinity Showcase**: Flagship product features
6. **Impact**: Measurable results and metrics
7. **Get Involved**: Donation, partnership, and volunteer opportunities

### Interactive Elements
- Mobile-responsive navigation
- Smooth scrolling between sections
- Animated statistics counters
- Fade-in animations on scroll
- Accessible keyboard navigation

## 🚀 Deployment Guide

### Git Repository Setup
```bash
# Initialize repository
cd esposure4all-website
git init
git add .
git commit -m "Initial commit: Esposure4All website"

# Create GitHub repository
# Add remote origin
git remote add origin https://github.com/[username]/esposure4all-website.git
git branch -M main
git push -u origin main
```

### Netlify Deployment
1. **Connect Repository**
   - Log into Netlify
   - Click "New site from Git"
   - Connect GitHub account
   - Select esposure4all-website repository

2. **Build Settings**
   - Build command: (leave empty - static site)
   - Publish directory: `/`
   - No environment variables needed

3. **Deploy Site**
   - Click "Deploy site"
   - Wait for deployment (usually < 1 minute)
   - Get temporary Netlify URL

### Domain Configuration (GoDaddy → Netlify)

#### Step 1: Prepare at GoDaddy
1. Log into GoDaddy account
2. Navigate to "My Products" → Domains
3. Find Esposure4All.org
4. Click "Manage" → "Domain Settings"

#### Step 2: Update DNS Settings
1. In GoDaddy DNS Management:
   ```
   Type: A     Name: @    Value: 75.2.60.5
   Type: CNAME Name: www  Value: [your-site].netlify.app
   ```

2. Alternative: Use Netlify DNS (Recommended)
   - In Netlify: Domain settings → Add custom domain
   - Follow prompts to update nameservers at GoDaddy:
     ```
     dns1.p01.nsone.net
     dns2.p01.nsone.net
     dns3.p01.nsone.net
     dns4.p01.nsone.net
     ```

#### Step 3: Configure in Netlify
1. Site settings → Domain management
2. Add custom domain: Esposure4All.org
3. Add domain alias: www.Esposure4All.org
4. Enable HTTPS (automatic with Let's Encrypt)

#### Step 4: Verify Setup
- DNS propagation: 24-48 hours
- Check status in Netlify dashboard
- Test both versions (with and without www)

## 🎨 Content Guidelines

### Logo and Image Requirements
Needed assets:
- Esposure4All logo (PNG/SVG)
- Microsoft Philanthropies partnership badge
- Student/community photos (with permissions)
- Gaming/esports imagery
- Educational technology visuals

### Text Content Updates
Key areas requiring organization-specific content:
- Tax-exempt EIN number
- Specific program details
- Board member information
- Annual report links
- Privacy policy document

## 🔧 Maintenance

### Regular Updates
- Statistics and metrics (quarterly)
- Success stories and testimonials
- Partnership announcements
- Event listings
- Blog/news section (future enhancement)

### Performance Monitoring
- Page load speed < 3 seconds
- Mobile responsiveness testing
- Accessibility compliance (WCAG 2.1 AA)
- SEO optimization reviews

## 📊 Analytics Setup (Future)

Consider implementing:
- Google Analytics 4
- Donation conversion tracking
- Newsletter signup metrics
- Partner inquiry tracking

## 🤝 Partnership Integration

### Philanthropic Features
- Clear donation CTAs
- Partnership inquiry forms
- Impact measurement displays
- Grant application information
- Volunteer opportunity listings

### Microsoft Philanthropies
- Proper logo usage
- Grant acknowledgment
- Program alignment showcase
- Reporting integration

## 🔒 Security & Compliance

### Nonprofit Requirements
- 501(c)3 status disclosure
- Donation tax-deductibility notices
- Financial transparency links
- Privacy policy compliance
- Donor information protection

### Technical Security
- HTTPS enforcement via Netlify
- No sensitive data collection
- Secure contact form handling
- Regular security updates

## 📞 Support & Contact

**Technical Support**: Development team  
**Content Updates**: Communications team  
**Domain/Hosting**: IT administrator  

---

**Built for Impact** - Empowering youth through technology, one student at a time.