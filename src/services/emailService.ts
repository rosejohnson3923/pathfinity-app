// Azure Communication Services Email Service
// Handles sending emails for notifications, assignments, and reports

import { EmailClient } from '@azure/communication-email';
import { getSecureConfig } from './azureSecureConfig';

export interface EmailRecipient {
  email: string;
  displayName?: string;
}

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface SendEmailOptions {
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  name: string;
  contentType: string;
  contentInBase64: string;
}

export interface EmailStatus {
  messageId: string;
  status: 'queued' | 'outForDelivery' | 'delivered' | 'failed';
  error?: string;
}

class EmailService {
  private emailClient: EmailClient | null = null;
  private isInitialized = false;
  private fromEmail = 'noreply@pathfinity.school'; // Default from email

  // Initialize the email client
  async initialize(): Promise<void> {
    if (this.isInitialized && this.emailClient) {
      return;
    }

    try {
      console.log('🔐 Initializing Azure Communication Services Email...');
      
      const config = await getSecureConfig.getCommunicationServicesConfig();
      
      if (!config.connectionString) {
        throw new Error('Azure Communication Services connection string not found');
      }

      this.emailClient = new EmailClient(config.connectionString);
      this.isInitialized = true;
      
      console.log('✅ Azure Communication Services Email initialized');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      throw new Error('Email service initialization failed');
    }
  }

  // Send a single email
  async sendEmail(options: SendEmailOptions): Promise<EmailStatus> {
    try {
      await this.initialize();
      
      if (!this.emailClient) {
        throw new Error('Email client not initialized');
      }

      const emailMessage = {
        senderAddress: this.fromEmail,
        content: {
          subject: options.subject,
          html: options.htmlContent,
          plainText: options.textContent || this.stripHtml(options.htmlContent)
        },
        recipients: {
          to: options.to.map(recipient => ({
            address: recipient.email,
            displayName: recipient.displayName
          })),
          cc: options.cc?.map(recipient => ({
            address: recipient.email,
            displayName: recipient.displayName
          })),
          bcc: options.bcc?.map(recipient => ({
            address: recipient.email,
            displayName: recipient.displayName
          }))
        },
        attachments: options.attachments?.map(attachment => ({
          name: attachment.name,
          contentType: attachment.contentType,
          contentInBase64: attachment.contentInBase64
        }))
      };

      const poller = await this.emailClient.beginSend(emailMessage);
      const result = await poller.pollUntilDone();

      return {
        messageId: result.id,
        status: result.status as EmailStatus['status'],
        error: result.error?.message
      };
    } catch (error: any) {
      console.error('Failed to send email:', error);
      return {
        messageId: '',
        status: 'failed',
        error: error.message || 'Unknown error'
      };
    }
  }

  // Send assignment notification to student
  async sendAssignmentNotification(
    studentEmail: string,
    studentName: string,
    assignmentTitle: string,
    dueDate: string,
    assignmentUrl: string
  ): Promise<EmailStatus> {
    const template = this.getAssignmentNotificationTemplate(
      studentName,
      assignmentTitle,
      dueDate,
      assignmentUrl
    );

    return this.sendEmail({
      to: [{ email: studentEmail, displayName: studentName }],
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent
    });
  }

  // Send progress report to parent
  async sendProgressReport(
    parentEmail: string,
    parentName: string,
    studentName: string,
    reportData: {
      completedAssignments: number;
      totalAssignments: number;
      averageScore: number;
      recentAchievements: string[];
    },
    reportUrl: string
  ): Promise<EmailStatus> {
    const template = this.getProgressReportTemplate(
      parentName,
      studentName,
      reportData,
      reportUrl
    );

    return this.sendEmail({
      to: [{ email: parentEmail, displayName: parentName }],
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent
    });
  }

  // Send bulk emails (for notifications to multiple recipients)
  async sendBulkEmails(emails: SendEmailOptions[]): Promise<EmailStatus[]> {
    const results: EmailStatus[] = [];
    
    // Send in batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchPromises = batch.map(email => this.sendEmail(email));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            messageId: '',
            status: 'failed',
            error: result.reason?.message || 'Unknown error'
          });
        }
      });

      // Wait between batches to respect rate limits
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  // Set custom from email address
  setFromEmail(email: string): void {
    this.fromEmail = email;
  }

  // Get email delivery status
  async getEmailStatus(messageId: string): Promise<EmailStatus | null> {
    try {
      await this.initialize();
      
      if (!this.emailClient) {
        throw new Error('Email client not initialized');
      }

      // Note: This would need to be implemented based on ACS API
      // For now, return null as status checking may not be immediately available
      return null;
    } catch (error) {
      console.error('Failed to get email status:', error);
      return null;
    }
  }

  // Email templates
  private getAssignmentNotificationTemplate(
    studentName: string,
    assignmentTitle: string,
    dueDate: string,
    assignmentUrl: string
  ): EmailTemplate {
    const subject = `New Assignment: ${assignmentTitle}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Pathfinity</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Your Learning Journey Continues</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${studentName}! 👋</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You have a new assignment ready for you:
          </p>
          
          <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0 0 10px 0;">${assignmentTitle}</h3>
            <p style="color: #666; margin: 0;"><strong>Due Date:</strong> ${dueDate}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${assignmentUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Start Assignment
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            Remember, learning is a journey, not a destination. You've got this! 🌟
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This email was sent by Pathfinity Learning Platform
          </p>
        </div>
      </div>
    `;

    const textContent = `
Hi ${studentName}!

You have a new assignment ready for you:

${assignmentTitle}
Due Date: ${dueDate}

Start your assignment: ${assignmentUrl}

Remember, learning is a journey, not a destination. You've got this!

---
Pathfinity Learning Platform
    `;

    return { subject, htmlContent, textContent };
  }

  private getProgressReportTemplate(
    parentName: string,
    studentName: string,
    reportData: {
      completedAssignments: number;
      totalAssignments: number;
      averageScore: number;
      recentAchievements: string[];
    },
    reportUrl: string
  ): EmailTemplate {
    const subject = `${studentName}'s Progress Report - Week Summary`;
    const completionRate = Math.round((reportData.completedAssignments / reportData.totalAssignments) * 100);
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Pathfinity</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Weekly Progress Report</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${parentName}! 👋</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Here's ${studentName}'s learning progress for this week:
          </p>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0;">📊 This Week's Highlights</h3>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <div style="text-align: center; flex: 1;">
                <div style="font-size: 24px; font-weight: bold; color: #667eea;">${reportData.completedAssignments}</div>
                <div style="font-size: 12px; color: #666;">Assignments Completed</div>
              </div>
              <div style="text-align: center; flex: 1;">
                <div style="font-size: 24px; font-weight: bold; color: #28a745;">${completionRate}%</div>
                <div style="font-size: 12px; color: #666;">Completion Rate</div>
              </div>
              <div style="text-align: center; flex: 1;">
                <div style="font-size: 24px; font-weight: bold; color: #ffc107;">${reportData.averageScore}%</div>
                <div style="font-size: 12px; color: #666;">Average Score</div>
              </div>
            </div>
            
            ${reportData.recentAchievements.length > 0 ? `
              <h4 style="color: #333; margin: 20px 0 10px 0;">🏆 Recent Achievements</h4>
              <ul style="color: #666; padding-left: 20px;">
                ${reportData.recentAchievements.map(achievement => `<li>${achievement}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reportUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              View Full Report
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            Keep up the great work! ${studentName} is making excellent progress on their learning journey. 🌟
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This email was sent by Pathfinity Learning Platform
          </p>
        </div>
      </div>
    `;

    const textContent = `
Hello ${parentName}!

Here's ${studentName}'s learning progress for this week:

📊 This Week's Highlights:
- Assignments Completed: ${reportData.completedAssignments}
- Completion Rate: ${completionRate}%
- Average Score: ${reportData.averageScore}%

${reportData.recentAchievements.length > 0 ? `
🏆 Recent Achievements:
${reportData.recentAchievements.map(achievement => `- ${achievement}`).join('\n')}
` : ''}

View the full report: ${reportUrl}

Keep up the great work! ${studentName} is making excellent progress on their learning journey.

---
Pathfinity Learning Platform
    `;

    return { subject, htmlContent, textContent };
  }

  // Utility function to strip HTML tags for plain text
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Utility functions for common email operations
export const sendWelcomeEmail = async (userEmail: string, userName: string): Promise<EmailStatus> => {
  return emailService.sendEmail({
    to: [{ email: userEmail, displayName: userName }],
    subject: 'Welcome to Pathfinity! 🎉',
    htmlContent: `
      <h1>Welcome to Pathfinity, ${userName}!</h1>
      <p>We're excited to have you join our learning community.</p>
      <p>Get started by logging in to your dashboard and exploring your personalized learning path.</p>
    `,
    textContent: `Welcome to Pathfinity, ${userName}! We're excited to have you join our learning community.`
  });
};

export const sendPasswordResetEmail = async (userEmail: string, resetUrl: string): Promise<EmailStatus> => {
  return emailService.sendEmail({
    to: [{ email: userEmail }],
    subject: 'Reset Your Pathfinity Password',
    htmlContent: `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 24 hours.</p>
    `,
    textContent: `Password reset request. Click this link to reset your password: ${resetUrl}. This link will expire in 24 hours.`
  });
};