// GET /api/accounts          → list the caller's accounts (primary first)
// POST /api/accounts         → open a new account

import { and, desc, eq, ne } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";
import { createAccountSchema } from "@/lib/validators/account";
import { defaultNickname, generateAccountNumber } from "@/lib/accounts";

export const GET = apiHandler({
  handler: async ({ user }) => {
    const rows = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, user.id), ne(accounts.status, "closed")))
      .orderBy(desc(accounts.isPrimary), accounts.createdAt);

    return ok({ data: rows });
  },
});

export const POST = apiHandler({
  schema: createAccountSchema,
  handler: async ({ user, body }) => {
    // The first account a user opens becomes their primary; subsequent
    // ones default to non-primary. The user can change primary later via
    // PATCH /api/accounts/[id] { setPrimary: true }.
    const existing = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(and(eq(accounts.userId, user.id), ne(accounts.status, "closed")))
      .limit(1);
    const isPrimary = existing.length === 0;

    // Retry once on the rare account_number collision.
    let inserted: typeof accounts.$inferSelect | undefined;
    for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
      try {
        const [row] = await db
          .insert(accounts)
          .values({
            userId: user.id,
            accountType: body.accountType,
            nickname: body.nickname ?? defaultNickname(body.accountType),
            accountNumber: generateAccountNumber(),
            isPrimary,
          })
          .returning();
        inserted = row;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("accounts_account_number")) continue;
        throw e;
      }
    }
    if (!inserted) {
      return err("Could not allocate an account number; please retry", 503);
    }

    return ok(inserted, 201);
  },
});
