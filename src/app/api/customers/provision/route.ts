import { apiHandler, ok, err } from "@/lib/api-handler";
import { logger } from "@/lib/logger";

// Manual retry for post-KYC provisioning. The primary trigger is the
// customer.kyb_status webhook; this endpoint lets the onboarding page (or an
// operator) re-run the idempotent pipeline if a step failed or the webhook
// was missed. Completed steps are skipped.
export const POST = apiHandler({
  rateLimit: { limit: 5, window: "15m" },
  handler: async ({ user }) => {
    try {
      const { provisionCustomer } = await import("@/lib/dakota/provisioning");
      const result = await provisionCustomer(user.id);
      return ok(result);
    } catch (error) {
      logger.error("Provisioning retry error:", { detail: error instanceof Error ? error.message : String(error) })
      const message =
        error instanceof Error && /not active|no Dakota customer/.test(error.message)
          ? error.message
          : "Provisioning failed. Please try again.";
      return err(message, 502);
    }
  },
});
