// GET/PATCH /api/users/preferences — notification settings.
// The row is created lazily with defaults on first read.
import { z } from "zod";
import { eq } from "drizzle-orm";
import { apiHandler, ok } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";

async function getOrCreate(userId: string) {
  const [existing] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(userPreferences)
    .values({ userId })
    .onConflictDoNothing({ target: userPreferences.userId })
    .returning();
  if (created) return created;
  const [raced] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  return raced;
}

export const GET = apiHandler({
  handler: async ({ user }) => ok(await getOrCreate(user.id)),
});

const patchSchema = z
  .object({
    emailTransactions: z.boolean().optional(),
    emailSecurity: z.boolean().optional(),
    emailProduct: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "Nothing to update");

export const PATCH = apiHandler({
  schema: patchSchema,
  handler: async ({ user, body }) => {
    await getOrCreate(user.id);
    const [updated] = await db
      .update(userPreferences)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(userPreferences.userId, user.id))
      .returning();
    return ok(updated);
  },
});
