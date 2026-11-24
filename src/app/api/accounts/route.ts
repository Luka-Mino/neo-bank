// GET /api/accounts          → list the org's accounts (primary first)
// POST /api/accounts         → open the main account, or a side account

import { and, desc, eq, ne } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { accounts } from "@/lib/db/schema";
import { createAccountSchema } from "@/lib/validators/account";
import { defaultNickname, generateAccountNumber } from "@/lib/accounts";
import { withOrg } from "@/lib/db/with-org";
import { openSideAccount, SideAccountError } from "@/lib/side-accounts";

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

// Not orgScoped: opening a side account may call Dakota (its own wallet), so
// each DB step runs in its own withOrg. The org's first account is its MAIN
// account; every later one is a SIDE account (SIDE-ACCOUNTS-PLAN.md).
export const POST = apiHandler({
  schema: createAccountSchema,
  rateLimit: { limit: 20, window: "1h" },
  handler: async ({ user, body }) => {
    if (!user.orgId) return err("No active organization", 403);
    const orgId = user.orgId;
    const nickname = body.nickname ?? defaultNickname();

    const anyOpen = await withOrg(orgId, (tx) =>
      tx
        .select({ id: accounts.id })
        .from(accounts)
        .where(and(eq(accounts.orgId, orgId), ne(accounts.status, "closed")))
        .limit(1)
    );

    let inserted: typeof accounts.$inferSelect | undefined;
    try {
      if (anyOpen.length === 0) {
        inserted = await withOrg(orgId, async (tx) => {
          // Retry on the rare account_number collision.
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const [row] = await tx
                .insert(accounts)
                .values({
                  orgId,
                  userId: user.id, // creator/actor
                  accountType: body.accountType,
                  nickname,
                  accountNumber: generateAccountNumber(),
                  isPrimary: true,
                })
                .returning();
              return row;
            } catch (e) {
              const msg = e instanceof Error ? e.message : String(e);
              if (!msg.includes("accounts_account_number") || attempt === 2) throw e;
            }
          }
          return undefined;
        });
      } else {
        inserted = await openSideAccount({ orgId, userId: user.id, nickname });
      }
    } catch (e) {
      if (e instanceof SideAccountError) return err(e.message, 409, { reason: e.reason });
      throw e;
    }
    if (!inserted) {
      return err("Could not allocate an account number; please retry", 503);
    }

    await logAudit({
      orgId,
      actorType: "user",
      actorId: user.id,
      action: "account_opened",
      resourceType: "account",
      resourceId: inserted.id,
      metadata: { kind: inserted.isPrimary ? "main" : "side", status: inserted.status },
    });
    return ok(inserted, 201);
  },
});
