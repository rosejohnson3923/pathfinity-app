/**
 * Puppeteer Page Capture Script for Pathfinity Migration
 * Captures all pages and states for each demo user as reference for migration
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000';
const CAPTURES_DIR = './captures';

// Demo users representing each grade category
const DEMO_USERS = [
  { 
    username: 'sam_k@demo.com',  // Update with actual email format
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

// Ensure captures directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
}

// Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main capture function
async function captureAllPages() {
  console.log('🚀 Starting Pathfinity Page Capture...\n');
  
  // Create main captures directory
  ensureDirectoryExists(CAPTURES_DIR);
  
  // Launch browser (visible for debugging)
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for background execution
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Process each demo user
    for (const user of DEMO_USERS) {
      console.log(`\n📸 Capturing pages for ${user.displayName} (Grade ${user.grade})`);
      console.log('='.repeat(50));
      
      const userDir = path.join(CAPTURES_DIR, `${user.displayName.toLowerCase()}_grade${user.grade}`);
      ensureDirectoryExists(userDir);
      
      // Create subdirectories for organization
      const dirs = {
        auth: path.join(userDir, '01-auth'),
        dashboard: path.join(userDir, '02-dashboard'),
        learn: path.join(userDir, '03-learn'),
        experience: path.join(userDir, '04-experience'),
        discover: path.join(userDir, '05-discover'),
        profile: path.join(userDir, '06-profile')
      };
      
      Object.values(dirs).forEach(dir => ensureDirectoryExists(dir));
      
      const page = await browser.newPage();
      
      try {
        // 1. AUTHENTICATION FLOW
        console.log('📍 Capturing authentication flow...');
        
        // Login page - empty
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
        await delay(1000);
        await page.screenshot({ 
          path: path.join(dirs.auth, '01-login-empty.png'),
          fullPage: true 
        });
        console.log('  ✓ Login page (empty)');
        
        // Type credentials (but don't submit yet)
        await page.type('input[type="email"], input[name="email"], #email', user.username);
        await page.type('input[type="password"], input[name="password"], #password', user.password);
        await page.screenshot({ 
          path: path.join(dirs.auth, '02-login-filled.png'),
          fullPage: true 
        });
        console.log('  ✓ Login page (filled)');
        
        // Submit login with error handling
        try {
          await page.click('button[type="submit"], #login-button, button:has-text("Sign In")');
          
          // Wait for navigation to dashboard or onboarding
          await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
          await delay(2000);
          
          // Check if we're on dashboard or need onboarding
          const currentUrl = page.url();
          console.log(`  ✓ Navigated to: ${currentUrl}`);
          
          // Check for login error
          const loginError = await page.$('.error-message, .alert-error, [role="alert"]').catch(() => null);
          if (loginError) {
            const errorText = await loginError.evaluate(el => el.textContent);
            console.log(`  ⚠️ Login error detected: ${errorText}`);
            await page.screenshot({ 
              path: path.join(dirs.auth, '03-login-error.png'),
              fullPage: true 
            });
          }
        } catch (navError) {
          console.log('  ⚠️ Navigation failed, capturing current state...');
          await page.screenshot({ 
            path: path.join(dirs.auth, 'ERROR-login-failed.png'),
            fullPage: true 
          });
          
          // Try to continue anyway
          console.log('  ⚠️ Attempting to continue despite login failure...');
        }
        
        // 2. DASHBOARD
        console.log('📍 Capturing dashboard...');
        
        // Wait for dashboard elements to load
        await page.waitForSelector('[class*="dashboard"], [class*="Dashboard"], .bento-grid, .student-dashboard', { 
          timeout: 10000 
        }).catch(() => {
          console.log('  ⚠️ Dashboard selector not found, capturing anyway...');
        });
        
        await delay(2000); // Let animations complete
        
        // Main dashboard view
        await page.screenshot({ 
          path: path.join(dirs.dashboard, '01-main-view.png'),
          fullPage: true 
        });
        console.log('  ✓ Dashboard main view');
        
        // Try hovering over Learn card
        const learnCard = await page.$('[class*="learn"], [class*="Learn"], .bento-learn-card').catch(() => null);
        if (learnCard) {
          await learnCard.hover();
          await delay(500);
          await page.screenshot({ 
            path: path.join(dirs.dashboard, '02-learn-hover.png'),
            fullPage: true 
          });
          console.log('  ✓ Learn card hover state');
        }
        
        // 3. LEARN MODULE
        console.log('📍 Capturing Learn module...');
        
        if (learnCard) {
          await learnCard.click();
          await delay(3000); // Wait for transition
          
          // Check for CareerContextScreen
          const hasCareerContext = await page.$('.career-context-screen').catch(() => null);
          if (hasCareerContext) {
            await page.screenshot({ 
              path: path.join(dirs.learn, '01-career-context.png'),
              fullPage: true 
            });
            console.log('  ✓ Career context screen');
            
            // Look for and click the start button
            const startButton = await page.$('.start-journey-button, button:has-text("Begin"), button:has-text("Start")').catch(() => null);
            if (startButton) {
              await startButton.click();
              await delay(2000);
              await page.screenshot({ 
                path: path.join(dirs.learn, '02-after-start.png'),
                fullPage: true 
              });
              console.log('  ✓ Learn content after start');
            }
          } else {
            // Direct to learn content
            await page.screenshot({ 
              path: path.join(dirs.learn, '01-learn-content.png'),
              fullPage: true 
            });
            console.log('  ✓ Learn content');
          }
          
          // Check for questions
          const hasQuestion = await page.$('[class*="question"], [class*="Question"]').catch(() => null);
          if (hasQuestion) {
            await page.screenshot({ 
              path: path.join(dirs.learn, '03-question.png'),
              fullPage: true 
            });
            console.log('  ✓ Question presentation');
          }
          
          // Go back to dashboard
          const backButton = await page.$('button:has-text("Back"), [class*="back"]').catch(() => null);
          if (backButton) {
            await backButton.click();
            await delay(2000);
          } else {
            // Try browser back
            await page.goBack();
            await delay(2000);
          }
        }
        
        // 4. EXPERIENCE MODULE
        console.log('📍 Capturing Experience module...');
        
        const experienceCard = await page.$('[class*="experience"], [class*="Experience"], .bento-experience-card').catch(() => null);
        if (experienceCard) {
          await experienceCard.click();
          await delay(3000);
          
          await page.screenshot({ 
            path: path.join(dirs.experience, '01-experience-intro.png'),
            fullPage: true 
          });
          console.log('  ✓ Experience introduction');
          
          // Check for interactive elements
          const hasInteractive = await page.$('[class*="canvas"], [class*="workspace"], [class*="simulation"]').catch(() => null);
          if (hasInteractive) {
            await page.screenshot({ 
              path: path.join(dirs.experience, '02-interactive.png'),
              fullPage: true 
            });
            console.log('  ✓ Interactive workspace');
          }
          
          // Go back
          await page.goBack();
          await delay(2000);
        }
        
        // 5. DISCOVER MODULE
        console.log('📍 Capturing Discover module...');
        
        const discoverCard = await page.$('[class*="discover"], [class*="Discover"], .bento-discover-card').catch(() => null);
        if (discoverCard) {
          await discoverCard.click();
          await delay(3000);
          
          await page.screenshot({ 
            path: path.join(dirs.discover, '01-discover-content.png'),
            fullPage: true 
          });
          console.log('  ✓ Discover content');
          
          // Go back
          await page.goBack();
          await delay(2000);
        }
        
        // 6. PROFILE/SETTINGS (if accessible)
        console.log('📍 Checking for profile/settings...');
        
        const profileButton = await page.$('[class*="profile"], [class*="avatar"], [class*="user-menu"]').catch(() => null);
        if (profileButton) {
          await profileButton.click();
          await delay(1000);
          
          await page.screenshot({ 
            path: path.join(dirs.profile, '01-profile-menu.png'),
            fullPage: true 
          });
          console.log('  ✓ Profile/settings menu');
        }
        
        // 7. GENERATE PDF OF COMPLETE FLOW
        console.log('📄 Generating PDF...');
        
        await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle0' });
        await delay(2000);
        
        await page.pdf({ 
          path: path.join(userDir, `${user.displayName.toLowerCase()}_complete_flow.pdf`),
          format: 'A4',
          printBackground: true,
          margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });
        console.log('  ✓ PDF generated');
        
        // Create summary JSON
        const summary = {
          user: user.displayName,
          grade: user.grade,
          captureDate: new Date().toISOString(),
          capturedPages: {
            auth: fs.readdirSync(dirs.auth).length,
            dashboard: fs.readdirSync(dirs.dashboard).length,
            learn: fs.readdirSync(dirs.learn).length,
            experience: fs.readdirSync(dirs.experience).length,
            discover: fs.readdirSync(dirs.discover).length,
            profile: fs.readdirSync(dirs.profile).length
          }
        };
        
        fs.writeFileSync(
          path.join(userDir, 'capture_summary.json'),
          JSON.stringify(summary, null, 2)
        );
        console.log('  ✓ Summary JSON created');
        
        console.log(`✅ Completed capture for ${user.displayName}`);
        
      } catch (error) {
        console.error(`❌ Error capturing pages for ${user.displayName}:`, error.message);
      } finally {
        await page.close();
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Page capture complete!');
    console.log(`📁 Files saved to: ${path.resolve(CAPTURES_DIR)}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await browser.close();
  }
}

// Run the capture
captureAllPages().catch(console.error);

/* 
USAGE INSTRUCTIONS:
1. Install Puppeteer: npm install puppeteer
2. Make sure the app is running on localhost:3000
3. Update DEMO_USERS with actual login credentials if different
4. Run: node capture-pages.js
5. Check the captures/ folder for results

TROUBLESHOOTING:
- If selectors don't match, check actual class names in DevTools
- If login fails, verify the email/password field selectors
- If navigation fails, increase delay times
- For headless mode, change headless: false to true
*/