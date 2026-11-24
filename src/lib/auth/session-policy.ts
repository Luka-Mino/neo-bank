// Session lifetime (decided 2026-11-24):
//   - 2 hours maximum from sign-in, however active the user is;
//   - 30 minutes of inactivity signs you out.
//
// How it's enforced:
//   - Idle: the session JWT (and cookie) expires IDLE_TIMEOUT_S after it was
//     last re-issued (Auth.js `session.maxAge`). Only the browser's session
//     refresh re-issues it, and <SessionTimeouts> refreshes on real user
//     activity at most every REFRESH_EVERY_MS. So a closed or idle tab stops
//     refreshing and the server rejects the token 30 minutes later.
//   - Absolute: the jwt callback stamps `authTime` at sign-in and rejects the
//     token once MAX_SESSION_S has passed (isSessionTooOld), on every request.
//   - The browser also signs out on its own at those moments, with a message,
//     so nobody is left on a page whose session has quietly expired.

export const MAX_SESSION_S = 2 * 60 * 60;
export const IDLE_TIMEOUT_S = 30 * 60;
/** Re-issue the session at most this often while the user is active. */
export const REFRESH_EVERY_MS = 5 * 60 * 1000;
/** Warn this long before the 2-hour limit. */
export const MAX_SESSION_WARNING_MS = 5 * 60 * 1000;

/** Server: has the 2-hour limit passed? A token without `authTime` predates
 *  this policy and is treated as expired (one extra sign-in, then normal). */
export function isSessionTooOld(authTimeS: number | undefined, nowMs: number = Date.now()): boolean {
  if (typeof authTimeS !== "number" || !Number.isFinite(authTimeS)) return true;
  return nowMs - authTimeS * 1000 >= MAX_SESSION_S * 1000;
}

export type TimeoutState = "active" | "warn_max" | "idle" | "max";

/** Browser: what should happen now, given sign-in time and last activity? */
export function timeoutState(params: {
  authTimeS: number | undefined;
  lastActivityMs: number;
  nowMs: number;
}): TimeoutState {
  const { authTimeS, lastActivityMs, nowMs } = params;
  if (authTimeS !== undefined && nowMs - authTimeS * 1000 >= MAX_SESSION_S * 1000) return "max";
  if (nowMs - lastActivityMs >= IDLE_TIMEOUT_S * 1000) return "idle";
  if (authTimeS !== undefined && nowMs - authTimeS * 1000 >= MAX_SESSION_S * 1000 - MAX_SESSION_WARNING_MS) {
    return "warn_max";
  }
  return "active";
}

/** Browser: should this bit of activity re-issue the session now? */
export function shouldRefresh(lastRefreshMs: number, nowMs: number): boolean {
  return nowMs - lastRefreshMs >= REFRESH_EVERY_MS;
}
