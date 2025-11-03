// apps/api/src/modules/integrations/email/email.service.ts

import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async sendSuspensionEmail(user: any, reason: string, until: Date | null): Promise<void> {
    try {
      const msg = {
        to: user.email,
        from: process.env.FROM_EMAIL || 'no-reply@oliver.com',
        subject: 'Account Suspension Notice',
        html: `
          <h2>Account Suspension Notice</h2>
          <p>Dear ${user.displayName || user.username},</p>
          <p>Your account has been suspended for the following reason:</p>
          <blockquote>${reason}</blockquote>
          ${until ? `<p>Your account will be automatically reinstated on ${until.toLocaleDateString()}.</p>` : '<p>This suspension is permanent unless you appeal.</p>'}
          <p>If you believe this is a mistake, please contact our support team.</p>
          <p>Best regards,<br>Oliver Team</p>
        `,
      };

      await sgMail.send(msg);
      this.logger.log(`Suspension email sent to ${user.email}`);
    } catch (error) {
      this.logger.error('Failed to send suspension email', error);
    }
  }

  async sendPasswordResetEmail(user: any, tempPassword: string): Promise<void> {
    try {
      const msg = {
        to: user.email,
        from: process.env.FROM_EMAIL || 'no-reply@oliver.com',
        subject: 'Password Reset - Temporary Password',
        html: `
          <h2>Password Reset</h2>
          <p>Dear ${user.displayName || user.username},</p>
          <p>Your password has been reset by an administrator. Your temporary password is:</p>
          <h3 style="background: #f0f0f0; padding: 10px; font-family: monospace;">${tempPassword}</h3>
          <p><strong>Important:</strong> Please log in and change this password immediately.</p>
          <p>If you did not request this password reset, please contact support immediately.</p>
          <p>Best regards,<br>Oliver Team</p>
        `,
      };

      await sgMail.send(msg);
      this.logger.log(`Password reset email sent to ${user.email}`);
    } catch (error) {
      this.logger.error('Failed to send password reset email', error);
    }
  }

  async sendKycApprovalEmail(user: any): Promise<void> {
    try {
      const msg = {
        to: user.email,
        from: process.env.FROM_EMAIL || 'no-reply@oliver.com',
        subject: 'KYC Verification Approved',
        html: `
          <h2>KYC Verification Approved</h2>
          <p>Dear ${user.displayName || user.username},</p>
          <p>Congratulations! Your identity verification has been approved.</p>
          <p>You now have full access to all platform features.</p>
          <p>Thank you for completing the verification process.</p>
          <p>Best regards,<br>Oliver Team</p>
        `,
      };

      await sgMail.send(msg);
      this.logger.log(`KYC approval email sent to ${user.email}`);
    } catch (error) {
      this.logger.error('Failed to send KYC approval email', error);
    }
  }

  async sendKycRejectionEmail(user: any, reason: string): Promise<void> {
    try {
      const msg = {
        to: user.email,
        from: process.env.FROM_EMAIL || 'no-reply@oliver.com',
        subject: 'KYC Verification - Action Required',
        html: `
          <h2>KYC Verification Update</h2>
          <p>Dear ${user.displayName || user.username},</p>
          <p>Unfortunately, we were unable to verify your identity at this time.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>Please review the requirements and submit your documents again.</p>
          <p>If you have questions, please contact our support team.</p>
          <p>Best regards,<br>Oliver Team</p>
        `,
      };

      await sgMail.send(msg);
      this.logger.log(`KYC rejection email sent to ${user.email}`);
    } catch (error) {
      this.logger.error('Failed to send KYC rejection email', error);
    }
  }
}
