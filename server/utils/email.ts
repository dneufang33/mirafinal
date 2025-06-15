import nodemailer from 'nodemailer';
import { config } from '../config';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpSecure,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"Mira Oracle" <${config.smtpUser}>`,
    to: email,
    subject: "Reset Your Cosmic Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a2e; color: #fff;">
        <h1 style="color: #ffd700; text-align: center; font-family: 'Playfair Display', serif;">Reset Your Cosmic Password</h1>
        <p style="font-size: 16px; line-height: 1.6;">Dear Seeker of the Stars,</p>
        <p style="font-size: 16px; line-height: 1.6;">We received a request to reset your password for your Mira Oracle account. The cosmic energies have aligned to help you regain access to your celestial sanctuary.</p>
        <p style="font-size: 16px; line-height: 1.6;">Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(to right, #ffd700, #ff69b4); color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #888;">If you didn't request this password reset, you can safely ignore this email. The cosmic forces will protect your account.</p>
        <p style="font-size: 14px; color: #888;">This link will expire in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">With celestial blessings,<br>The Mira Oracle Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
} 