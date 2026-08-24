import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/orgs";

// Surface the org claims (minted in the jwt callback) on the session + token so
// routes read them type-safely instead of via `as any` casts.

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      orgId?: string;
      role?: Role;
      canApprove?: boolean;
      canMoveMoney?: boolean;
      canExport?: boolean;
    } & DefaultSession["user"];
    kycStatus?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    tv?: number;
    kycStatus?: string;
    orgId?: string;
    role?: Role;
    canApprove?: boolean;
    canMoveMoney?: boolean;
    canExport?: boolean;
  }
}
