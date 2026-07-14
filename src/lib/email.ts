import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "Moneta <notifications@moneta.example>";
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
    subject: "Verify your Moneta email",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Welcome to Moneta</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Please verify your email address to activate your account.
        </p>
        <a href="${url}" style="display: inline-block; background: #4ac280; color: #122e2e; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
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
    subject: "Reset your Moneta password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Reset Your Password</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          We received a request to reset your password. Click the button below to choose a new one.
        </p>
        <a href="${url}" style="display: inline-block; background: #4ac280; color: #122e2e; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 32px;">
          This link expires in 24 hours. If you didn't request this, you can ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendEmailOtp(to: string, code: string) {
  return sendEmail({
    to,
    subject: `Your Moneta sign-in code: ${code}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <p style="font-weight: 700; color: #122e2e; font-size: 18px; margin-bottom: 24px;">moneta</p>
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #212020;">Your sign-in code</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
          Enter this code to finish signing in:
        </p>
        <p style="font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #122e2e; margin: 0 0 16px;">${code}</p>
        <p style="color: #999; font-size: 13px;">
          This code expires in 10 minutes. If you didn't try to sign in, change
          your password — someone may have it.
        </p>
      </div>
    `,
  });
}

export async function sendMagicLinkEmail(to: string, token: string) {
  const url = `${APP_URL}/magic?token=${token}`;
  return sendEmail({
    to,
    subject: "Your Moneta sign-in link",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <p style="font-weight: 700; color: #122e2e; font-size: 18px; margin-bottom: 24px;">moneta</p>
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 16px; color: #212020;">Sign in to Moneta</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Click the button below to sign in. No password needed.
        </p>
        <a href="${url}" style="display: inline-block; background: #4ac280; color: #122e2e; padding: 12px 32px; border-radius: 999px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Sign in to Moneta
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 32px;">
          This link expires in 15 minutes and can be used once. If you didn't request it, you can safely ignore this email — your account is unaffected.
        </p>
      </div>
    `,
  });
}

// Generic branded notification email — the in-app notification's email
// mirror (see createNotification in src/lib/notifications.ts).
export async function sendNotificationEmail(params: {
  to: string;
  subject: string;
  heading: string;
  body: string;
  actionUrl?: string;
  actionLabel?: string;
}) {
  const action =
    params.actionUrl && params.actionLabel
      ? `<a href="${APP_URL}${params.actionUrl}" style="display: inline-block; background: #4ac280; color: #122e2e; padding: 12px 32px; border-radius: 999px; text-decoration: none; font-size: 14px; font-weight: 600;">${params.actionLabel}</a>`
      : "";
  return sendEmail({
    to: params.to,
    subject: params.subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <p style="font-weight: 700; color: #122e2e; font-size: 18px; margin-bottom: 24px;">moneta</p>
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 16px; color: #212020;">${params.heading}</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">${params.body}</p>
        ${action}
        <p style="color: #999; font-size: 12px; margin-top: 32px;">
          Moneta is a financial technology company, not a bank. Manage email
          preferences in <a href="${APP_URL}/settings" style="color: #999;">Settings</a>.
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
    subject: `Moneta: ${params.type} ${params.status}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Transaction Update</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Your ${params.type} of ${params.amount} is now <strong>${params.status}</strong>.
        </p>
        <a href="${APP_URL}/transactions" style="display: inline-block; background: #4ac280; color: #122e2e; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
          View Details
        </a>
      </div>
    `,
  });
}
