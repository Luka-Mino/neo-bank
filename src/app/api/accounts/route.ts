// GET /api/accounts          → list the org's accounts (primary first)
// POST /api/accounts         → open a new account

import { and, desc, eq, ne } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { accounts } from "@/lib/db/schema";
import { createAccountSchema } from "@/lib/validators/account";
import { defaultNickname, generateAccountNumber } from "@/lib/accounts";

export const GET = apiHandler({
  orgScoped: true,
  handler: async ({ user, db }) => {
    const rows = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.orgId, user.orgId!), ne(accounts.status, "closed")))
      .orderBy(desc(accounts.isPrimary), accounts.createdAt);

    return ok({ data: rows });
  },
});

export const POST = apiHandler({
  orgScoped: true,
  schema: createAccountSchema,
  handler: async ({ user, body, db }) => {
    // The first account an org opens becomes its primary; subsequent ones
    // default to non-primary. Changeable later via PATCH /api/accounts/[id].
    const existing = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(and(eq(accounts.orgId, user.orgId!), ne(accounts.status, "closed")))
      .limit(1);
    const isPrimary = existing.length === 0;

    // Retry once on the rare account_number collision.
    let inserted: typeof accounts.$inferSelect | undefined;
    for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
      try {
        const [row] = await db
          .insert(accounts)
          .values({
            orgId: user.orgId!,
            userId: user.id, // creator/actor
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

    await logAudit({
      actorType: "user",
      actorId: user.id,
      action: "account_opened",
      resourceType: "account",
      resourceId: inserted.id,
      metadata: { accountType: inserted.accountType },
    });
    return ok(inserted, 201);
  },
});
