// API handler factory — adapted from Lawzy for NextAuth + Drizzle
import { NextRequest, NextResponse } from "next/server";
import { type ZodSchema } from "zod";
import { auth } from "@/lib/auth/config";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface RateLimitConfig {
  limit: number;
  window: "15m" | "1h" | "2h";
}

const WINDOW_MS: Record<string, number> = {
  "15m": 15 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "2h": 2 * 60 * 60 * 1000,
};

interface HandlerContext<TBody = unknown, TParams = Record<string, string>> {
  user: AuthUser;
  body: TBody;
  params: TParams;
  request: NextRequest;
}

type HandlerFn<TBody, TParams> = (
  ctx: HandlerContext<TBody, TParams>
) => Promise<NextResponse> | NextResponse;

interface ApiHandlerOptions<TBody, TParams> {
  auth?: boolean;
  rateLimit?: RateLimitConfig | false;
  schema?: ZodSchema<TBody>;
  handler: HandlerFn<TBody, TParams>;
}

// ─── Response helpers ───────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: { message } },
    { status }
  );
}

// ─── Handler factory ────────────────────────────────────────────────────────

export function apiHandler<TBody = unknown, TParams = Record<string, string>>(
  options: ApiHandlerOptions<TBody, TParams>
) {
  const {
    auth: requireAuth = true,
    rateLimit: rateLimitConfig,
    schema,
    handler,
  } = options;

  return (async (
    request: NextRequest,
    routeContext?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<NextResponse> => {
    try {
      // 1. Authentication via NextAuth
      let user: AuthUser | null = null;
      if (requireAuth) {
        const session = await auth();
        if (!session?.user?.id) {
          return err("Authentication required", 401);
        }
        user = {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.name || undefined,
        };
      }

      // 2. Rate limiting
      const method = request.method.toUpperCase();
      const isRead = method === "GET" || method === "HEAD";

      if (rateLimitConfig !== false) {
        const shouldRateLimit = isRead ? !!rateLimitConfig : true;

        if (shouldRateLimit) {
          const config = rateLimitConfig || {
            limit: 60,
            window: "1h" as const,
          };
          const ip = getClientIp(request);
          const windowMs = WINDOW_MS[config.window] || WINDOW_MS["1h"];
          const rl = await rateLimit(ip, config.limit, windowMs);
          if (!rl.allowed) {
            return err("Too many requests. Please try again later.", 429);
          }
        }
      }

      // 3. Parse route params
      let params = {} as TParams;
      if (routeContext?.params) {
        params =
          routeContext.params instanceof Promise
            ? await routeContext.params
            : routeContext.params;
      }

      // 4. Parse and validate request body
      let body = undefined as unknown as TBody;
      if (schema && method !== "GET" && method !== "HEAD") {
        let rawBody: unknown;
        try {
          rawBody = await request.json();
        } catch {
          return err("Invalid JSON in request body", 400);
        }

        const result = schema.safeParse(rawBody);
        if (!result.success) {
          const issues = result.error.issues || [];
          if (issues.length > 0) {
            const first = issues[0];
            const path =
              first.path && first.path.length > 0
                ? `${first.path.join(".")}: `
                : "";
            return err(`${path}${first.message}`, 400);
          }
          return err("Invalid request body", 400);
        }
        body = result.data;
      }

      // 5. Execute handler
      return await handler({
        user: user as AuthUser,
        body,
        params,
        request,
      });
    } catch (error) {
      const route = request.nextUrl.pathname;
      const method = request.method;
      console.error(`${method} ${route} error:`, error);

      if (error && typeof error === "object" && "issues" in error) {
        const issues = (error as { issues: { message: string }[] }).issues;
        if (issues?.[0]) return err(issues[0].message, 400);
      }

      return err("Internal server error", 500);
    }
  }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
