import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "NeoBank <noreply@neobank.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(`[DEV EMAIL] Body preview: ${html.slice(0, 200)}...`);
    return { success: true, dev: true };
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }

  return { success: true };
}

// ─── Email functions ────────────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${APP_URL}/verify-email?token=${token}`;
  return sendEmail({
    to,
    subject: "Verify your NeoBank email",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Welcome to NeoBank</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Please verify your email address to activate your account.
        </p>
        <a href="${url}" style="display: inline-block; background: #111; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Verify Email
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 32px;">
          This link expires in 24 hours. If you didn't create an account, you can ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  return sendEmail({
    to,
    subject: "Reset your NeoBank password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Reset Your Password</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          We received a request to reset your password. Click the button below to choose a new one.
        </p>
        <a href="${url}" style="display: inline-block; background: #111; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 32px;">
          This link expires in 24 hours. If you didn't request this, you can ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendTransactionAlert(
  to: string,
  params: { type: string; amount: string; status: string }
) {
  return sendEmail({
    to,
    subject: `NeoBank: ${params.type} ${params.status}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Transaction Update</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Your ${params.type} of ${params.amount} is now <strong>${params.status}</strong>.
        </p>
        <a href="${APP_URL}/transactions" style="display: inline-block; background: #111; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
          View Details
        </a>
      </div>
    `,
  });
}
