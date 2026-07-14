import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { revokeSessions } from "@/lib/auth/sessions";
import { createNotification } from "@/lib/notifications";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const schema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export const PATCH = apiHandler({
  rateLimit: { limit: 5, window: "1h" },
  schema,
  handler: async ({ user, body }) => {
    // Verify current password
    const [dbUser] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!dbUser) return err("User not found", 404);

    const isValid = await bcrypt.compare(body.currentPassword, dbUser.passwordHash);
    if (!isValid) return err("Current password is incorrect", 400);

    // Update password
    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    await logAudit({
      actorType: "user",
      actorId: user.id,
      action: "password_changed",
      resourceType: "user",
      resourceId: user.id,
    });
    // Invalidate all existing sessions (incl. this one) — a password change
    // signs everyone out; the user re-authenticates with the new password.
    await revokeSessions(user.id, "password_changed");
    await createNotification({
      userId: user.id,
      type: "security",
      title: "Your password was changed",
      body: "If this wasn't you, reset your password immediately and enable two-factor authentication.",
      actionUrl: "/settings",
    });
    return ok({ message: "Password updated successfully" });
  },
});
