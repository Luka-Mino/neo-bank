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

        // Brute-force guard: 15 attempts per email per 15 minutes (counts
        // successes too — nobody legitimately signs in 15 times in 15min).
        // Keyed by target email so credential-stuffing one account stalls
        // regardless of source IP. Uses the shared limiter (Upstash-backed
        // in production, in-memory in dev).
        const rl = await rateLimit(`login:${email}`, 15, 15 * 60 * 1000);
        if (!rl.allowed) {
          logAudit({
            actorType: "system",
            action: "login_rate_limited",
            resourceType: "user",
            resourceId: email,
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
          const code = (credentials.totp as string | undefined)?.trim();
          if (!code) throw new TwoFactorRequired();
          if (!verifyTotpCode(decryptSecret(row.totpSecret), code)) {
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

      // Fetch KYC status — but don't break the session if DB query fails
      if (token.id) {
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
            // DB query failed — keep existing kycStatus or default
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
