// Client-side JSON calls for /app money screens.
//
// The important distinction is the OUTCOME of a failed write:
//   "rejected" — the server answered with a 4xx: nothing happened, the user
//                can fix the input and try again.
//   "unknown"  — network failure or 5xx: the request may have been applied.
//                For money movement the UI must NOT offer a blind retry
//                (that's how double payments happen); it sends the user to
//                Activity to check first.

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly outcome: "rejected" | "unknown",
    /** Machine-readable reason from err(..., { reason }) when present. */
    readonly reason?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function postJson<T = unknown>(
  url: string,
  body: unknown,
  { method = "POST" }: { method?: "POST" | "PATCH" | "PUT" | "DELETE" } = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "We lost connection before we heard back.",
      0,
      "unknown"
    );
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const e = json?.error;
    const message =
      (typeof e === "string" ? e : e?.message) ||
      (res.status >= 500 ? "Something went wrong on our side." : "That didn't work. Please check and try again.");
    throw new ApiError(message, res.status, res.status >= 500 ? "unknown" : "rejected", e?.reason);
  }
  return (json?.data ?? json) as T;
}

/** The server's "turn on 2FA first" / "verify your email first" refusals. */
export function setupActionFor(err: unknown): { label: string; href: string } | null {
  if (!(err instanceof ApiError) || err.status !== 403) return null;
  const m = err.message.toLowerCase();
  if (m.includes("two-factor")) return { label: "Turn on two-step sign-in", href: "/settings" };
  if (m.includes("verify your email")) return { label: "Resend verification email", href: "/settings" };
  if (m.includes("kyc")) return { label: "Verify your identity", href: "/onboarding" };
  return null;
}
