import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, dakotaCustomers, magicLinkTokens } from "@/lib/db/schema";
import { isKycBypassed } from "@/lib/auth/kyc-bypass";
import { decryptSecret, verifyTotpCode } from "@/lib/auth/totp";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

// Password was right but the account has 2FA — the login page shows the
// code field and resubmits. Distinct from a bad password on purpose only
// AFTER password verification, so it leaks nothing to guessers.
class TwoFactorRequired extends CredentialsSignin {
  code = "2fa_required";
}
class InvalidTwoFactorCode extends CredentialsSignin {
  code = "2fa_invalid";
}
class TooManyAttempts extends CredentialsSignin {
  code = "rate_limited";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "2FA code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase();
        const password = credentials.password as string;

        // Progressive brute-force guard: two tiers, keyed by target email so
        // credential-stuffing one account stalls regardless of source IP.
        //  • fast: 15 / 15 min — normal fumbling
        //  • slow: 40 / 6 h   — a sustained low-and-slow attack that stays
        //    under the fast window still hits a much longer lockout
        const [fast, slow] = await Promise.all([
          rateLimit(`login:fast:${email}`, 15, 15 * 60 * 1000),
          rateLimit(`login:slow:${email}`, 40, 6 * 60 * 60 * 1000),
        ]);
        if (!fast.allowed || !slow.allowed) {
          logAudit({
            actorType: "system",
            action: "login_rate_limited",
            resourceType: "user",
            resourceId: email,
            metadata: { tier: !slow.allowed ? "slow" : "fast" },
          });
          throw new TooManyAttempts();
        }

        let row;
        try {
          const found = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);
          row = found[0];
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }

        if (!row) return null;
        if (row.deletedAt) return null; // deleted accounts can't sign in

        const isValid = await bcrypt.compare(password, row.passwordHash);
        if (!isValid) {
          logAudit({
            actorType: "system",
            action: "login_failed",
            resourceType: "user",
            resourceId: row.id,
          });
          return null;
        }

        if (row.totpEnabledAt && row.totpSecret) {
          // Authenticator-app 2FA takes precedence when both are enabled.
          const code = (credentials.totp as string | undefined)?.trim();
          if (!code) throw new TwoFactorRequired();
          if (!verifyTotpCode(decryptSecret(row.totpSecret), code)) {
            throw new InvalidTwoFactorCode();
          }
        } else if (row.emailOtpEnabled) {
          // Email-code 2FA: first pass (no code) issues + emails a code and
          // asks for it; second pass verifies. Reuses the same error codes so
          // the login page shows the same code field.
          const code = (credentials.totp as string | undefined)?.trim();
          if (!code) {
            const { issueEmailOtp } = await import("@/lib/auth/email-otp");
            await issueEmailOtp(row.id, row.email);
            throw new TwoFactorRequired();
          }
          const { verifyEmailOtp } = await import("@/lib/auth/email-otp");
          if (!(await verifyEmailOtp(row.id, code))) {
            throw new InvalidTwoFactorCode();
          }
        }

        return {
          id: row.id,
          email: row.email,
          name: row.fullName,
        };
      },
    }),
    // Passwordless sign-in. Consumes a single-use magic-link token
    // (atomic mark-used so it can't be replayed), then still enforces 2FA
    // if the account has it — an email link must not weaken the second
    // factor. See POST /api/auth/magic-link.
    Credentials({
      id: "magic-link",
      name: "Magic Link",
      credentials: {
        token: { label: "Token", type: "text" },
        totp: { label: "2FA code", type: "text" },
      },
      async authorize(credentials) {
        const token = credentials?.token as string | undefined;
        if (!token) return null;

        // Atomic consume: only succeeds if unused and unexpired.
        let consumed;
        try {
          consumed = await db
            .update(magicLinkTokens)
            .set({ usedAt: new Date() })
            .where(
              and(
                eq(magicLinkTokens.token, token),
                isNull(magicLinkTokens.usedAt),
                gt(magicLinkTokens.expiresAt, sql`now()`)
              )
            )
            .returning({ userId: magicLinkTokens.userId });
        } catch (error) {
          console.error("Magic-link consume error:", error);
          return null;
        }
        if (consumed.length === 0) return null; // invalid / expired / used

        const [row] = await db
          .select()
          .from(users)
          .where(eq(users.id, consumed[0].userId))
          .limit(1);
        if (!row) return null;

        if (row.totpEnabledAt && row.totpSecret) {
          const code = (credentials?.totp as string | undefined)?.trim();
          if (!code) throw new TwoFactorRequired();
          if (!verifyTotpCode(decryptSecret(row.totpSecret), code)) {
            throw new InvalidTwoFactorCode();
          }
        }

        return { id: row.id, email: row.email, name: row.fullName };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      if (token.id) {
        // KYC status + token-version check in one query (this callback runs
        // per request; folding both in keeps it a single round-trip).
        try {
          const [row] = await db
            .select({ tokenVersion: users.tokenVersion })
            .from(users)
            .where(eq(users.id, token.id as string))
            .limit(1);

          // Session revocation: a token minted before the current version is
          // rejected (password change / 2FA disable / sign-out-everywhere).
          if (!row) return null;
          if (user) {
            token.tv = row.tokenVersion; // fresh login — adopt current version
          } else if (token.tv !== row.tokenVersion) {
            return null; // stale token → session invalidated
          }
        } catch {
          // DB unavailable — don't lock out a valid session on a transient
          // error; keep the existing token (fail-open on availability only).
        }

        if (isKycBypassed()) {
          token.kycStatus = "active";
        } else {
          try {
            const customer = await db
              .select({ kycStatus: dakotaCustomers.kycStatus })
              .from(dakotaCustomers)
              .where(eq(dakotaCustomers.userId, token.id as string))
              .limit(1);
            token.kycStatus = customer[0]?.kycStatus ?? "none";
          } catch {
            token.kycStatus = token.kycStatus ?? "none";
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session as any).kycStatus = token.kycStatus as string;
      }
      return session;
    },
  },
  events: {
    // Fires only after a fully successful sign-in (password + any 2FA).
    // Records the device and sends a "new sign-in" alert for unfamiliar ones.
    async signIn({ user }) {
      if (!user?.id) return;
      try {
        const { headers } = await import("next/headers");
        const h = await headers();
        const ip =
          h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          h.get("x-real-ip") ||
          "0.0.0.0";
        const userAgent = h.get("user-agent") ?? "unknown";
        const { recordLoginDevice } = await import("@/lib/auth/login-devices");
        await recordLoginDevice({ userId: user.id, userAgent, ip });
      } catch (error) {
        console.error("signIn event error:", error);
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
});
