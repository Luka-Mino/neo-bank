import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, dakotaCustomers } from "@/lib/db/schema";
import { isKycBypassed } from "@/lib/auth/kyc-bypass";
import { decryptSecret, verifyTotpCode } from "@/lib/auth/totp";

// Password was right but the account has 2FA — the login page shows the
// code field and resubmits. Distinct from a bad password on purpose only
// AFTER password verification, so it leaks nothing to guessers.
class TwoFactorRequired extends CredentialsSignin {
  code = "2fa_required";
}
class InvalidTwoFactorCode extends CredentialsSignin {
  code = "2fa_invalid";
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

        const email = credentials.email as string;
        const password = credentials.password as string;

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
        if (!isValid) return null;

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
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
});
