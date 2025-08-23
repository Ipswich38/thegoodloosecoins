// Custom email service for sending OTP codes with proper branding
// This can be used as fallback if Supabase email customization is limited

export interface OTPEmailData {
  email: string;
  otpCode: string;
  username: string;
  type: 'signup' | 'login' | 'password_reset';
}

// Generate a 6-digit OTP code
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP temporarily (in production, use Redis or database)
const otpStore = new Map<string, { code: string; expires: number; userData?: any }>();

export function storeOTP(email: string, code: string, userData?: any): void {
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email, { code, expires, userData });
}

export function verifyOTP(email: string, code: string): { valid: boolean; userData?: any } {
  const stored = otpStore.get(email);
  
  if (!stored) {
    return { valid: false };
  }
  
  if (Date.now() > stored.expires) {
    otpStore.delete(email);
    return { valid: false };
  }
  
  if (stored.code !== code) {
    return { valid: false };
  }
  
  const userData = stored.userData;
  otpStore.delete(email); // Use OTP only once
  return { valid: true, userData };
}

// Email template for OTP
export function generateOTPEmail(data: OTPEmailData): { subject: string; html: string; text: string } {
  const { email, otpCode, username, type } = data;
  
  const subject = type === 'signup' 
    ? 'Verify Your Email - The Good Loose Coins'
    : 'Your Verification Code - The Good Loose Coins';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #00CED1 0%, #20B2AA 100%); color: white; border-radius: 8px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .tagline { font-size: 14px; opacity: 0.9; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; text-align: center; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #00CED1; background: white; padding: 15px 20px; border-radius: 8px; border: 2px dashed #00CED1; margin: 20px 0; font-family: monospace; }
        .warning { font-size: 12px; color: #666; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">The Good Loose Coins</div>
        <div class="tagline">Every coin counts, every act of kindness matters</div>
      </div>
      
      <div class="content">
        <h2>Hello ${username}!</h2>
        <p>Welcome to The Good Loose Coins community. To complete your ${type === 'signup' ? 'registration' : 'verification'}, please enter this 6-digit code:</p>
        
        <div class="otp-code">${otpCode}</div>
        
        <p>This code will expire in <strong>10 minutes</strong> for your security.</p>
        
        ${type === 'signup' ? `
          <p>Once verified, you'll be able to start making a difference with your loose change donations!</p>
        ` : ''}
        
        <div class="warning">
          If you didn't request this code, please ignore this email. Your account remains secure.
        </div>
      </div>
      
      <div class="footer">
        <p>© 2024 The Good Loose Coins. All rights reserved.</p>
        <p>Making the world better, one coin at a time.</p>
      </div>
    </body>
    </html>
  `;
  
  const text = `
The Good Loose Coins - Verification Code

Hello ${username}!

Your 6-digit verification code is: ${otpCode}

This code will expire in 10 minutes.

${type === 'signup' ? 'Welcome to The Good Loose Coins community!' : ''}

If you didn't request this code, please ignore this email.

© 2024 The Good Loose Coins
Making the world better, one coin at a time.
  `;
  
  return { subject, html, text };
}

// Send email using Nodemailer (requires SMTP configuration)
export async function sendOTPEmail(data: OTPEmailData): Promise<boolean> {
  try {
    // This would require email service setup (SendGrid, AWS SES, etc.)
    // For now, we'll use Supabase but with custom OTP generation
    console.log('Custom OTP email would be sent:', data);
    
    // In production, you would:
    // 1. Configure nodemailer with SMTP settings
    // 2. Send the email using the template above
    // 3. Return success/failure status
    
    return true;
  } catch (error) {
    console.error('Failed to send custom OTP email:', error);
    return false;
  }
}