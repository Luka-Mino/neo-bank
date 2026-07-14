import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { auditLog } from "@/lib/db/schema";

interface AuditParams {
  actorId?: string;
  actorType?: "user" | "admin" | "system";
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logAudit(params: AuditParams) {
  try {
    await db.insert(auditLog).values({
      actorId: params.actorId,
      actorType: params.actorType || "system",
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata: params.metadata,
      ipAddress: params.ipAddress,
    });
  } catch (error) {
    // Never let audit logging break the main operation
    logger.error("Audit log error:", { detail: error instanceof Error ? error.message : String(error) })
  }
}
