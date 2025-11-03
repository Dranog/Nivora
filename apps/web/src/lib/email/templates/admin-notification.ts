/**
 * Email Templates for Admin Notifications
 * Professional HTML email templates
 */

interface EmailTemplateProps {
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  adminName?: string;
}

export function generateAdminEmailHTML({
  userName,
  userEmail,
  subject,
  message,
  adminName = 'L\'équipe Oliver',
}: EmailTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #00B8A9 0%, #00A89A 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      color: #ffffff;
      font-size: 32px;
      font-weight: bold;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333333;
      margin-bottom: 20px;
    }
    .message {
      color: #555555;
      font-size: 16px;
      margin-bottom: 30px;
      white-space: pre-wrap;
    }
    .footer {
      background-color: #f8f8f8;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #eeeeee;
    }
    .footer-text {
      color: #999999;
      font-size: 14px;
      margin: 5px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #00B8A9 0%, #00A89A 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 500;
    }
    .divider {
      border: 0;
      height: 1px;
      background-color: #eeeeee;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1 class="logo">OLIVER</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Bonjour ${userName},</p>

      <div class="message">${message}</div>

      <hr class="divider">

      <p style="color: #666; font-size: 14px;">
        Ceci est un message de ${adminName}.<br>
        Si vous avez des questions, n'hésitez pas à nous contacter.
      </p>

      <a href="https://oliver.com/support" class="button">
        Contacter le support
      </a>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">
        <strong>OLIVER</strong> - Plateforme de contenu créateur
      </p>
      <p class="footer-text">
        Vous recevez cet email car vous êtes membre de Oliver.
      </p>
      <p class="footer-text">
        <a href="https://oliver.com" style="color: #00B8A9; text-decoration: none;">oliver.com</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generatePlainTextEmail({
  userName,
  message,
  adminName = 'L\'équipe Oliver',
}: EmailTemplateProps): string {
  return `
Bonjour ${userName},

${message}

---

Ceci est un message de ${adminName}.
Si vous avez des questions, n'hésitez pas à nous contacter.

Contacter le support : https://oliver.com/support

---

OLIVER - Plateforme de contenu créateur
Vous recevez cet email car vous êtes membre de Oliver.
oliver.com
  `.trim();
}

// Example usage in API route:
/*
import { generateAdminEmailHTML, generatePlainTextEmail } from '@/lib/email/templates/admin-notification';

const html = generateAdminEmailHTML({
  userName: user.name,
  userEmail: user.email,
  subject: body.subject,
  message: body.message,
  adminName: 'John Doe',
});

const text = generatePlainTextEmail({
  userName: user.name,
  userEmail: user.email,
  subject: body.subject,
  message: body.message,
  adminName: 'John Doe',
});

await resend.emails.send({
  from: 'admin@oliver.com',
  to: user.email,
  subject: body.subject,
  html,
  text,
});
*/
