/**
 * PATHFINITY AI CHARACTER FLOW - E2E TESTS
 * End-to-end tests for complete AI character interaction workflows
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const TEST_USER = {
  email: 'e2e.test@pathfinity.ai',
  password: 'TestPassword123!',
  firstName: 'E2E',
  lastName: 'Test',
  gradeLevel: 'K'
};

test.describe('AI Character Flow E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set up viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Navigate to application
    await page.goto(BASE_URL);
    
    // Login as test user
    await loginAsTestUser(page);
  });

  test.afterEach(async () => {
    await page.close();
  });

  describe('Character Selection and Interaction', () => {
    test('should display all four AI characters on dashboard', async () => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Wait for dashboard to load
      await page.waitForSelector('[data-testid="dashboard-container"]');
      
      // Check that all characters are present
      await expect(page.locator('[data-testid="character-finn"]')).toBeVisible();
      await expect(page.locator('[data-testid="character-sage"]')).toBeVisible();
      await expect(page.locator('[data-testid="character-spark"]')).toBeVisible();
      await expect(page.locator('[data-testid="character-harmony"]')).toBeVisible();
    });

    test('should recommend Finn for kindergarten students', async () => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      const recommendedCharacter = page.locator('[data-testid="recommended-character"]');
      await expect(recommendedCharacter).toContainText('Finn');
      await expect(recommendedCharacter).toHaveClass(/recommended/);
    });

    test('should open character chat when character is clicked', async () => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Click on Finn
      await page.click('[data-testid="character-finn"]');
      
      // Chat interface should open
      await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
      await expect(page.locator('[data-testid="chat-character-name"]')).toContainText('Finn');
      
      // Character avatar should be visible
      await expect(page.locator('[data-testid="character-avatar"]')).toBeVisible();
    });
  });

  describe('Chat Interface Functionality', () => {
    test('should send message and receive AI response', async () => {
      await openChatWithCharacter(page, 'finn');
      
      const messageInput = page.locator('[data-testid="chat-input"]');
      const sendButton = page.locator('[data-testid="send-button"]');
      
      // Type a message
      await messageInput.fill('Hello Finn! Can you help me count to 5?');
      await sendButton.click();
      
      // User message should appear
      await expect(page.locator('[data-testid="user-message"]').last()).toContainText('Hello Finn');
      
      // Wait for AI response (with timeout for API call)
      await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible({ timeout: 15000 });
      
      // Response should contain appropriate content for counting
      const aiResponse = await page.locator('[data-testid="ai-response"]').last().textContent();
      expect(aiResponse?.toLowerCase()).toMatch(/count|number|1|2|3|4|5/);
    });

    test('should show typing indicator while AI is responding', async () => {
      await openChatWithCharacter(page, 'finn');
      
      const messageInput = page.locator('[data-testid="chat-input"]');
      const sendButton = page.locator('[data-testid="send-button"]');
      
      await messageInput.fill('Tell me a story');
      await sendButton.click();
      
      // Typing indicator should appear
      await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();
      
      // Character avatar should show speaking animation
      await expect(page.locator('[data-testid="character-avatar"]')).toHaveClass(/speaking/);
      
      // Wait for response
      await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible({ timeout: 15000 });
      
      // Typing indicator should disappear
      await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible();
    });

    test('should handle voice input (if supported)', async () => {
      await openChatWithCharacter(page, 'finn');
      
      const voiceButton = page.locator('[data-testid="voice-input-button"]');
      
      // Check if voice input is available
      if (await voiceButton.isVisible()) {
        await voiceButton.click();
        
        // Voice recording UI should appear
        await expect(page.locator('[data-testid="voice-recording"]')).toBeVisible();
        
        // Simulate stopping recording (since we can't actually record in E2E)
        await page.click('[data-testid="stop-recording"]');
      }
    });

    test('should maintain conversation context', async () => {
      await openChatWithCharacter(page, 'sage');
      
      const messageInput = page.locator('[data-testid="chat-input"]');
      const sendButton = page.locator('[data-testid="send-button"]');
      
      // First message about animals
      await messageInput.fill('Tell me about cats');
      await sendButton.click();
      await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible({ timeout: 15000 });
      
      // Follow-up message that references previous context
      await messageInput.fill('What about dogs?');
      await sendButton.click();
      await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible({ timeout: 15000 });
      
      // Response should acknowledge the context
      const secondResponse = await page.locator('[data-testid="ai-response"]').last().textContent();
      expect(secondResponse?.toLowerCase()).toMatch(/dog|animal|pet/);
    });
  });

  describe('Age-Progressive Interface', () => {
    test('should adapt interface for kindergarten student', async () => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Interface should show kindergarten-appropriate styling
      await expect(page.locator('[data-testid="dashboard-container"]')).toHaveClass(/age-group-k-2/);
      
      // Large, colorful buttons for young learners
      const characterButtons = page.locator('[data-testid^="character-"]');
      await expect(characterButtons.first()).toHaveClass(/large-button/);
      
      // Simple navigation
      await expect(page.locator('[data-testid="simple-nav"]')).toBeVisible();
    });

    test('should show appropriate character recommendations by age', async () => {
      // Test for kindergarten (should recommend Finn)
      await setUserGradeLevel(page, 'K');
      await page.goto(`${BASE_URL}/dashboard`);
      
      const recommendedCharacter = page.locator('[data-testid="recommended-character"]');
      await expect(recommendedCharacter).toContainText('Finn');
      
      // Test for 5th grade (should recommend Sage)
      await setUserGradeLevel(page, '5');
      await page.reload();
      
      await expect(recommendedCharacter).toContainText('Sage');
    });
  });

  describe('Learning Analytics Integration', () => {
    test('should track AI character interactions', async () => {
      await openChatWithCharacter(page, 'finn');
      
      // Send a message
      const messageInput = page.locator('[data-testid="chat-input"]');
      await messageInput.fill('Help me with counting');
      await page.click('[data-testid="send-button"]');
      
      // Wait for response
      await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible({ timeout: 15000 });
      
      // Check analytics dashboard for interaction
      await page.goto(`${BASE_URL}/analytics`);
      
      // Should show recent AI interaction
      await expect(page.locator('[data-testid="recent-interactions"]')).toContainText('finn');
      await expect(page.locator('[data-testid="interaction-count"]')).not.toContainText('0');
    });

    test('should update learning progress after AI assistance', async () => {
      await openChatWithCharacter(page, 'finn');
      
      // Ask for help with specific skill
      const messageInput = page.locator('[data-testid="chat-input"]');
      await messageInput.fill('Teach me about addition');
      await page.click('[data-testid="send-button"]');
      
      await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible({ timeout: 15000 });
      
      // Mark interaction as helpful
      await page.click('[data-testid="helpful-button"]');
      
      // Check progress dashboard
      await page.goto(`${BASE_URL}/progress`);
      
      // Should show progress in Math
      await expect(page.locator('[data-testid="math-progress"]')).toBeVisible();
    });
  });

  describe('Safety and Content Filtering', () => {
    test('should filter inappropriate content requests', async () => {
      await openChatWithCharacter(page, 'finn');
      
      const messageInput = page.locator('[data-testid="chat-input"]');
      await messageInput.fill('Tell me something scary');
      await page.click('[data-testid="send-button"]');
      
      await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible({ timeout: 15000 });
      
      // Response should be appropriate and redirect to educational content
      const response = await page.locator('[data-testid="ai-response"]').last().textContent();
      expect(response?.toLowerCase()).toMatch(/appropriate|learn|safe|different/);
    });

    test('should show safety indicators', async () => {
      await openChatWithCharacter(page, 'finn');
      
      // Safety indicator should be visible
      await expect(page.locator('[data-testid="safety-indicator"]')).toBeVisible();
      await expect(page.locator('[data-testid="safety-indicator"]')).toHaveClass(/safe/);
    });
  });

  describe('Responsive Design', () => {
    test('should work on tablet viewport', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Characters should be arranged appropriately for tablet
      const characterGrid = page.locator('[data-testid="character-grid"]');
      await expect(characterGrid).toHaveClass(/tablet-layout/);
      
      // Chat interface should adapt
      await openChatWithCharacter(page, 'finn');
      await expect(page.locator('[data-testid="chat-interface"]')).toHaveClass(/tablet-view/);
    });

    test('should work on mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Mobile navigation should be visible
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
      
      // Characters should stack vertically
      const characterGrid = page.locator('[data-testid="character-grid"]');
      await expect(characterGrid).toHaveClass(/mobile-layout/);
    });
  });

  describe('Accessibility', () => {
    test('should be keyboard navigable', async () => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Tab through character selection
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // First character should have focus
      await expect(page.locator('[data-testid="character-finn"]')).toBeFocused();
      
      // Enter should open chat
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    });

    test('should have proper ARIA labels', async () => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Characters should have descriptive labels
      const finnCharacter = page.locator('[data-testid="character-finn"]');
      await expect(finnCharacter).toHaveAttribute('aria-label', 'Chat with Finn, your friendly learning companion');
      
      // Chat input should be labeled
      await openChatWithCharacter(page, 'finn');
      const chatInput = page.locator('[data-testid="chat-input"]');
      await expect(chatInput).toHaveAttribute('aria-label', 'Type your message to Finn');
    });

    test('should announce AI responses to screen readers', async () => {
      await openChatWithCharacter(page, 'finn');
      
      const messageInput = page.locator('[data-testid="chat-input"]');
      await messageInput.fill('Hello');
      await page.click('[data-testid="send-button"]');
      
      await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible({ timeout: 15000 });
      
      // Response should have aria-live region
      const responseContainer = page.locator('[data-testid="response-container"]');
      await expect(responseContainer).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Performance', () => {
    test('should load character avatars efficiently', async () => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Measure time to load all character avatars
      const startTime = Date.now();
      
      await expect(page.locator('[data-testid="character-finn"] img')).toBeVisible();
      await expect(page.locator('[data-testid="character-sage"] img')).toBeVisible();
      await expect(page.locator('[data-testid="character-spark"] img')).toBeVisible();
      await expect(page.locator('[data-testid="character-harmony"] img')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should handle multiple concurrent AI requests', async () => {
      await openChatWithCharacter(page, 'finn');
      
      const messageInput = page.locator('[data-testid="chat-input"]');
      
      // Send multiple messages quickly
      await messageInput.fill('First message');
      await page.click('[data-testid="send-button"]');
      
      await messageInput.fill('Second message');
      await page.click('[data-testid="send-button"]');
      
      // Both responses should eventually appear
      await expect(page.locator('[data-testid="ai-response"]').nth(0)).toBeVisible({ timeout: 20000 });
      await expect(page.locator('[data-testid="ai-response"]').nth(1)).toBeVisible({ timeout: 20000 });
    });
  });
});

// Helper functions

async function loginAsTestUser(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  
  await page.fill('[data-testid="email-input"]', TEST_USER.email);
  await page.fill('[data-testid="password-input"]', TEST_USER.password);
  await page.click('[data-testid="login-button"]');
  
  // Wait for successful login
  await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: 10000 });
}

async function openChatWithCharacter(page: Page, character: string) {
  await page.goto(`${BASE_URL}/dashboard`);
  await page.click(`[data-testid="character-${character}"]`);
  await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
}

async function setUserGradeLevel(page: Page, gradeLevel: string) {
  await page.goto(`${BASE_URL}/profile`);
  await page.selectOption('[data-testid="grade-level-select"]', gradeLevel);
  await page.click('[data-testid="save-profile"]');
  await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
}