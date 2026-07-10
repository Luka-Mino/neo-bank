/**
 * Returns true when the dev-only KYC bypass should be active.
 *
 * Hard-gated by NODE_ENV — even if BYPASS_KYC=true is set in a production
 * environment, this returns false. The production check runs first and
 * unconditionally, so the only way to make this return true in prod is to
 * lie about NODE_ENV at the OS level — which Next.js's own start command
 * won't do.
 *
 * The flag is intentionally a server-only env var (not NEXT_PUBLIC_*); the
 * bypass is applied at the data boundary so client code stays unchanged.
 */
export function isKycBypassed(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.BYPASS_KYC === "true";
}
