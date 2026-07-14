// PATCH /api/users/profile — editable profile fields.
// Email changes are deliberately excluded (they'd need re-verification and
// a Dakota customer update); name is safe to edit locally.
import { z } from "zod";
import { eq } from "drizzle-orm";
import { apiHandler, ok } from "@/lib/api-handler";
import { encryptField } from "@/lib/crypto/field";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  fullName: z.string().trim().min(2, "Name is too short").max(70),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$/, "Invalid phone number")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const PATCH = apiHandler({
  schema,
  rateLimit: { limit: 10, window: "1h" },
  handler: async ({ user, body }) => {
    const [updated] = await db
      .update(users)
      .set({
        fullName: body.fullName,
        ...(body.phone !== undefined
          ? { phone: body.phone ? encryptField(body.phone, "phone") : null }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning({ id: users.id, fullName: users.fullName, phone: users.phone });

    await logAudit({
      actorType: "user",
      actorId: user.id,
      action: "profile_updated",
      resourceType: "user",
      resourceId: user.id,
    });

    return ok(updated);
  },
});
