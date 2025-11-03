import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private config: ConfigService) {
    sgMail.setApiKey(this.config.get<string>('SENDGRID_API_KEY')!);
  }

  async sendOptInConfirmation(
    email: string,
    creatorName: string,
    confirmToken: string,
  ) {
    const confirmUrl = `${this.config.get<string>('FRONTEND_URL')!}/crm/confirm?token=${confirmToken}`;

    const msg = {
      to: email,
      from: {
        email: this.config.get<string>('SENDGRID_FROM_EMAIL')!,
        name: 'OLIVER Platform',
      },
      subject: `Confirm your subscription to ${creatorName}`,
      html: this.getOptInTemplate(creatorName, confirmUrl),
      text: `Please confirm your subscription to ${creatorName} by clicking: ${confirmUrl}`,
      trackingSettings: {
        clickTracking: { enable: false },
        openTracking: { enable: false },
      },
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send confirmation email');
    }
  }

  async sendWelcomeEmail(email: string, creatorName: string) {
    const msg = {
      to: email,
      from: {
        email: this.config.get<string>('SENDGRID_FROM_EMAIL')!,
        name: creatorName,
      },
      subject: `Welcome to ${creatorName}'s exclusive content`,
      html: this.getWelcomeTemplate(creatorName),
      text: `Thank you for subscribing to ${creatorName}!`,
    };

    await sgMail.send(msg);
  }

  async sendBulkEmail(
    emails: string[],
    subject: string,
    html: string,
    fromName: string,
  ) {
    const msg = {
      to: emails,
      from: {
        email: this.config.get<string>('SENDGRID_FROM_EMAIL')!,
        name: fromName,
      },
      subject,
      html,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
    };

    await sgMail.sendMultiple(msg);
  }

  private getOptInTemplate(creatorName: string, confirmUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: #6E56CF;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer { margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Confirm your subscription</h2>
          <p>Hi there!</p>
          <p>You (or someone using your email address) requested to join <strong>${creatorName}</strong>'s email list.</p>
          <p>To confirm your subscription and start receiving exclusive content, please click the button below:</p>
          <a href="${confirmUrl}" class="button">Confirm Subscription</a>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <div class="footer">
            <p>This link will expire in 24 hours.</p>
            <p>If the button doesn't work, copy and paste this URL into your browser:<br>${confirmUrl}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeTemplate(creatorName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Welcome! 🎉</h2>
          <p>Thank you for subscribing to <strong>${creatorName}</strong>'s exclusive content!</p>
          <p>You'll now receive updates about new posts, special offers, and exclusive content directly to your inbox.</p>
          <p>Stay tuned!</p>
          <p>- ${creatorName}</p>
        </div>
      </body>
      </html>
    `;
  }
}
