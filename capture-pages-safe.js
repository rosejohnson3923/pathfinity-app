/**
 * Safe Page Capture Script with Error Recovery
 * Handles page load failures gracefully and continues capturing what it can
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000';
const CAPTURES_DIR = './captures';
const MAX_RETRIES = 3;
const PAGE_TIMEOUT = 15000; // 15 seconds

// Demo users
const DEMO_USERS = [
  { 
    username: 'sam_k@demo.com',
    password: 'demo123',
    displayName: 'Sam',
    grade: 'K'
  },
  { 
    username: 'alex_1@demo.com',
    password: 'demo123',
    displayName: 'Alex',
    grade: '1'
  },
  { 
    username: 'jordan_7@demo.com',
    password: 'demo123',
    displayName: 'Jordan',
    grade: '7'
  },
  { 
    username: 'taylor_10@demo.com',
    password: 'demo123',
    displayName: 'Taylor',
    grade: '10'
  }
];

// Error tracking
let errorLog = [];

// Ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Safe navigation with retry
async function safeGoTo(page, url, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`  → Navigating to ${url} (attempt ${i + 1}/${retries})`);
      await page.goto(url, { 
        waitUntil: 'networkidle0', 
        timeout: PAGE_TIMEOUT 
      });
      console.log(`  ✓ Successfully loaded ${url}`);
      return true;
    } catch (error) {
      console.log(`  ⚠️ Failed to load ${url}: ${error.message}`);
      if (i === retries - 1) {
        errorLog.push({
          url,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        return false;
      }
      await delay(2000); // Wait before retry
    }
  }
  return false;
}

// Safe element wait
async function safeWaitForSelector(page, selector, options = {}) {
  try {
    await page.waitForSelector(selector, { 
      timeout: 5000,
      ...options 
    });
    return true;
  } catch (error) {
    console.log(`  ⚠️ Selector not found: ${selector}`);
    return false;
  }
}

// Safe click
async function safeClick(page, selector) {
  try {
    await page.click(selector);
    return true;
  } catch (error) {
    console.log(`  ⚠️ Cannot click: ${selector}`);
    return false;
  }
}

// Safe screenshot
async function safeScreenshot(page, filepath, label = '') {
  try {
    await page.screenshot({ 
      path: filepath,
      fullPage: true 
    });
    console.log(`  ✓ Captured: ${label || path.basename(filepath)}`);
    return true;
  } catch (error) {
    console.log(`  ⚠️ Screenshot failed: ${error.message}`);
    errorLog.push({
      action: 'screenshot',
      file: filepath,
      error: error.message
    });
    return false;
  }
}

// Check if we're logged in
async function checkLoginStatus(page) {
  // Check for common logged-in indicators
  const indicators = [
    '[class*="dashboard"]',
    '[class*="Dashboard"]',
    '.user-avatar',
    '.user-menu',
    '[class*="logout"]'
  ];
  
  for (const indicator of indicators) {
    const element = await page.$(indicator).catch(() => null);
    if (element) return true;
  }
  return false;
}

// Try alternative login methods
async function attemptLogin(page, user, dirs) {
  console.log('  🔐 Attempting login...');
  
  // Method 1: Standard form submission
  try {
    await page.type('input[type="email"], input[name="email"], #email', user.username);
    await page.type('input[type="password"], input[name="password"], #password', user.password);
    
    await safeScreenshot(page, path.join(dirs.auth, '02-login-filled.png'), 'Login form filled');
    
    // Try different submit button selectors
    const submitSelectors = [
      'button[type="submit"]',
      '#login-button',
      'button:contains("Sign In")',
      'button:contains("Login")',
      '.login-button',
      'form button'
    ];
    
    for (const selector of submitSelectors) {
      if (await safeClick(page, selector)) {
        console.log(`  ✓ Clicked submit button: ${selector}`);
        break;
      }
    }
    
    // Wait for navigation
    await page.waitForNavigation({ 
      waitUntil: 'networkidle0', 
      timeout: 10000 
    }).catch(() => {});
    
    await delay(2000);
    
    // Check if logged in
    if (await checkLoginStatus(page)) {
      console.log('  ✓ Login successful!');
      return true;
    }
    
  } catch (error) {
    console.log(`  ⚠️ Login attempt failed: ${error.message}`);
  }
  
  // Method 2: Check for error and capture it
  const errorElement = await page.$('.error, .alert, [role="alert"]').catch(() => null);
  if (errorElement) {
    const errorText = await errorElement.evaluate(el => el.textContent).catch(() => 'Unknown error');
    console.log(`  ⚠️ Login error: ${errorText}`);
    await safeScreenshot(page, path.join(dirs.auth, 'ERROR-login-message.png'), 'Login error message');
  }
  
  return false;
}

// Main capture function
async function captureAllPages() {
  console.log('🚀 Starting Safe Page Capture...\n');
  console.log('📋 This script will continue even if some pages fail to load.\n');
  
  ensureDirectoryExists(CAPTURES_DIR);
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-web-security',  // Help with CORS issues
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  try {
    // Process each demo user
    for (const user of DEMO_USERS) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📸 Capturing pages for ${user.displayName} (Grade ${user.grade})`);
      console.log('='.repeat(60));
      
      const userDir = path.join(CAPTURES_DIR, `${user.displayName.toLowerCase()}_grade${user.grade}`);
      ensureDirectoryExists(userDir);
      
      const dirs = {
        auth: path.join(userDir, '01-auth'),
        dashboard: path.join(userDir, '02-dashboard'),
        learn: path.join(userDir, '03-learn'),
        experience: path.join(userDir, '04-experience'),
        discover: path.join(userDir, '05-discover'),
        errors: path.join(userDir, 'ERRORS')
      };
      
      Object.values(dirs).forEach(dir => ensureDirectoryExists(dir));
      
      const page = await browser.newPage();
      
      // Set up console logging
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`  🔴 Console Error: ${msg.text()}`);
        }
      });
      
      // Track page errors
      page.on('pageerror', error => {
        console.log(`  🔴 Page Error: ${error.message}`);
        errorLog.push({
          user: user.displayName,
          type: 'page_error',
          error: error.message
        });
      });
      
      let captureReport = {
        user: user.displayName,
        grade: user.grade,
        timestamp: new Date().toISOString(),
        successful: [],
        failed: [],
        errors: []
      };
      
      try {
        // 1. LOGIN ATTEMPT
        console.log('\n📍 Authentication Flow');
        console.log('-'.repeat(40));
        
        if (await safeGoTo(page, `${BASE_URL}/login`)) {
          await safeScreenshot(page, path.join(dirs.auth, '01-login-empty.png'), 'Empty login form');
          captureReport.successful.push('login-page');
          
          const loggedIn = await attemptLogin(page, user, dirs);
          
          if (loggedIn) {
            captureReport.successful.push('login-success');
          } else {
            captureReport.failed.push('login-failed');
            console.log('  ⚠️ Could not log in, will capture public pages only');
          }
        } else {
          captureReport.failed.push('login-page-unreachable');
          console.log('  ⚠️ Login page unreachable, trying dashboard directly...');
          await safeGoTo(page, BASE_URL);
        }
        
        // 2. DASHBOARD ATTEMPT
        console.log('\n📍 Dashboard');
        console.log('-'.repeat(40));
        
        // Current state screenshot
        await safeScreenshot(page, path.join(dirs.dashboard, '01-current-state.png'), 'Current page state');
        
        // Look for dashboard elements
        const dashboardFound = await safeWaitForSelector(page, '[class*="dashboard"], [class*="Dashboard"], .bento-grid');
        
        if (dashboardFound) {
          await delay(2000); // Let animations complete
          await safeScreenshot(page, path.join(dirs.dashboard, '02-dashboard-main.png'), 'Dashboard main view');
          captureReport.successful.push('dashboard');
          
          // Try to capture each bento card
          const cards = ['learn', 'experience', 'discover', 'chat'];
          
          for (const cardType of cards) {
            console.log(`\n📍 ${cardType.charAt(0).toUpperCase() + cardType.slice(1)} Module`);
            console.log('-'.repeat(40));
            
            const cardSelector = `[class*="${cardType}"], .bento-${cardType}-card`;
            const card = await page.$(cardSelector).catch(() => null);
            
            if (card) {
              // Hover state
              await card.hover();
              await delay(500);
              await safeScreenshot(
                page, 
                path.join(dirs.dashboard, `03-${cardType}-hover.png`), 
                `${cardType} card hover`
              );
              
              // Try to click and navigate
              await card.click();
              await delay(3000); // Wait for navigation/modal
              
              const targetDir = dirs[cardType] || dirs.dashboard;
              await safeScreenshot(
                page, 
                path.join(targetDir, `01-${cardType}-content.png`), 
                `${cardType} content`
              );
              
              captureReport.successful.push(`${cardType}-module`);
              
              // Try to go back
              const backButton = await page.$('button:contains("Back"), [class*="back"]').catch(() => null);
              if (backButton) {
                await backButton.click();
              } else {
                await page.goBack();
              }
              await delay(2000);
              
            } else {
              console.log(`  ⚠️ ${cardType} card not found`);
              captureReport.failed.push(`${cardType}-module`);
            }
          }
        } else {
          console.log('  ⚠️ Dashboard not found');
          captureReport.failed.push('dashboard');
          
          // Capture whatever is visible
          await safeScreenshot(
            page, 
            path.join(dirs.errors, 'no-dashboard.png'), 
            'Page instead of dashboard'
          );
        }
        
        // 3. GENERATE REPORT
        console.log('\n📄 Generating Report');
        console.log('-'.repeat(40));
        
        // Save capture report
        captureReport.errors = errorLog.filter(e => e.user === user.displayName);
        
        fs.writeFileSync(
          path.join(userDir, 'capture_report.json'),
          JSON.stringify(captureReport, null, 2)
        );
        
        // Try to generate PDF
        try {
          await page.pdf({ 
            path: path.join(userDir, `${user.displayName.toLowerCase()}_attempted_flow.pdf`),
            format: 'A4',
            printBackground: true
          });
          console.log('  ✓ PDF generated');
        } catch (pdfError) {
          console.log(`  ⚠️ PDF generation failed: ${pdfError.message}`);
        }
        
        // Summary
        console.log('\n📊 Capture Summary:');
        console.log(`  ✅ Successful: ${captureReport.successful.length} pages`);
        console.log(`  ⚠️ Failed: ${captureReport.failed.length} pages`);
        console.log(`  🔴 Errors: ${captureReport.errors.length}`);
        
      } catch (userError) {
        console.error(`\n❌ Critical error for ${user.displayName}: ${userError.message}`);
        errorLog.push({
          user: user.displayName,
          type: 'critical',
          error: userError.message
        });
      } finally {
        await page.close();
      }
    }
    
    // Final report
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL CAPTURE REPORT');
    console.log('='.repeat(60));
    
    if (errorLog.length > 0) {
      console.log('\n⚠️ Errors encountered:');
      errorLog.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.user || 'General'}: ${err.error || err.type}`);
      });
      
      // Save error log
      fs.writeFileSync(
        path.join(CAPTURES_DIR, 'error_log.json'),
        JSON.stringify(errorLog, null, 2)
      );
    } else {
      console.log('\n✅ No errors encountered!');
    }
    
    console.log(`\n📁 Captures saved to: ${path.resolve(CAPTURES_DIR)}`);
    
  } finally {
    await browser.close();
  }
}

// Run with error handling
captureAllPages().catch(error => {
  console.error('\n💥 FATAL ERROR:', error);
  process.exit(1);
});

console.log(`
╔══════════════════════════════════════════════════════════╗
║  Safe Capture Mode: Will continue even if pages fail     ║
║  All errors will be logged to: captures/error_log.json   ║
╚══════════════════════════════════════════════════════════╝
`);