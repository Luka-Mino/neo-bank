import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, dakotaCustomers } from "@/lib/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);

          if (user.length === 0) return null;

          const isValid = await bcrypt.compare(password, user[0].passwordHash);
          if (!isValid) return null;

          return {
            id: user[0].id,
            email: user[0].email,
            name: user[0].fullName,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
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
