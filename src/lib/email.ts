import { POSTMARK_API_KEY } from '$env/static/private';

export class EmailService {
  private static apiKey = POSTMARK_API_KEY;
  private static baseUrl = 'https://api.postmarkapp.com';

  static async sendEmail(options: {
    to: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    from?: string;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/email`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': this.apiKey,
        },
        body: JSON.stringify({
          From: options.from || 'hello@offmarketprime.com',
          To: options.to,
          Subject: options.subject,
          HtmlBody: options.htmlBody,
          TextBody: options.textBody || this.stripHtml(options.htmlBody),
          MessageStream: 'outbound'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Postmark API error: ${error.Message}`);
      }

      const result = await response.json();
      return { success: true, messageId: result.MessageId };
    } catch (error: any) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendWelcomeEmail(email: string, confirmationUrl: string, firstName?: string) {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Off Market Prime</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { 
            display: inline-block; 
            background: #1e40af; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Off Market Prime</h1>
          </div>
          <div class="content">
            <h2>Hello${firstName ? ` ${firstName}` : ''}!</h2>
            <p>Thank you for joining Off Market Prime, your gateway to exclusive off-market properties in London's most prestigious neighborhoods.</p>
            
            <p>To complete your registration and start discovering premium properties, please confirm your email address:</p>
            
            <p style="text-align: center;">
              <a href="${confirmationUrl}" class="button">Confirm Your Email</a>
            </p>
            
            <p>Once confirmed, you'll have access to:</p>
            <ul>
              <li>Exclusive off-market property listings</li>
              <li>Personalized property recommendations</li>
              <li>Priority access to new listings</li>
              <li>Expert market insights</li>
            </ul>
            
            <p>If you have any questions, feel free to reply to this email or contact us at hello@offmarketprime.com</p>
            
            <p>Best regards,<br>The Off Market Prime Team</p>
          </div>
          <div class="footer">
            <p>Off Market Prime - Premium Off-Market Properties</p>
            <p>If you didn't create this account, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Off Market Prime - Please Confirm Your Email',
      htmlBody,
      from: 'hello@offmarketprime.com'
    });
  }

  static async sendPasswordResetEmail(email: string, resetUrl: string, firstName?: string) {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password - Off Market Prime</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { 
            display: inline-block; 
            background: #1e40af; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello${firstName ? ` ${firstName}` : ''}!</h2>
            <p>We received a request to reset your password for your Off Market Prime account.</p>
            
            <p>Click the button below to create a new password:</p>
            
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Your Password</a>
            </p>
            
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
            
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <p>Best regards,<br>The Off Market Prime Team</p>
          </div>
          <div class="footer">
            <p>Off Market Prime - Premium Off-Market Properties</p>
            <p>For security, this link will expire in 1 hour.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Off Market Prime Password',
      htmlBody,
      from: 'hello@offmarketprime.com'
    });
  }

  static async sendViewingRequestEmail(options: {
    to: string;
    propertyTitle: string;
    propertyLocation: string;
    propertyPrice: string;
    userName: string;
    userEmail: string;
    userPhone?: string;
    message?: string;
    requestId: string;
  }) {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Viewing Request - ${options.propertyTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .property-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .user-info { background: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Viewing Request</h1>
          </div>
          <div class="content">
            <h2>New viewing request received</h2>
            <p>A new viewing request has been submitted for one of your properties.</p>
            
            <div class="property-info">
              <h3>Property Details</h3>
              <p><strong>Property:</strong> ${options.propertyTitle}</p>
              <p><strong>Location:</strong> ${options.propertyLocation}</p>
              <p><strong>Price:</strong> ${options.propertyPrice}</p>
            </div>
            
            <div class="user-info">
              <h3>Requester Information</h3>
              <p><strong>Name:</strong> ${options.userName}</p>
              <p><strong>Email:</strong> ${options.userEmail}</p>
              ${options.userPhone ? `<p><strong>Phone:</strong> ${options.userPhone}</p>` : ''}
              ${options.message ? `<p><strong>Message:</strong><br>${options.message}</p>` : ''}
            </div>
            
            <p><strong>Request ID:</strong> ${options.requestId}</p>
            <p><em>Please respond to the client directly at ${options.userEmail}</em></p>
          </div>
          <div class="footer">
            <p>Off Market Prime - Property Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: options.to,
      subject: `New Viewing Request: ${options.propertyTitle}`,
      htmlBody,
      from: 'noreply@offmarketprime.com'
    });
  }

  static async sendViewingRequestConfirmation(options: {
    to: string;
    userName: string;
    propertyTitle: string;
    propertyLocation: string;
    propertyPrice: string;
  }) {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Viewing Request Confirmed - ${options.propertyTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .property-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Viewing Request Confirmed</h1>
          </div>
          <div class="content">
            <h2>Hello ${options.userName}!</h2>
            <p>Thank you for your interest in our property. We have received your viewing request and will be in touch shortly.</p>
            
            <div class="property-info">
              <h3>Property Details</h3>
              <p><strong>Property:</strong> ${options.propertyTitle}</p>
              <p><strong>Location:</strong> ${options.propertyLocation}</p>
              <p><strong>Price:</strong> ${options.propertyPrice}</p>
            </div>
            
            <p>Our team will review your request and contact you within 24 hours to arrange a viewing at your convenience.</p>
            
            <p>In the meantime, if you have any questions, please don't hesitate to contact us at hello@offmarketprime.com</p>
            
            <p>Best regards,<br>The Off Market Prime Team</p>
          </div>
          <div class="footer">
            <p>Off Market Prime - Premium Off-Market Properties</p>
            <p>We'll be in touch within 24 hours to arrange your viewing.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: options.to,
      subject: `Viewing Request Confirmed: ${options.propertyTitle}`,
      htmlBody,
      from: 'hello@offmarketprime.com'
    });
  }

  private static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }
}
