"use client";

// Browser half of the session policy (src/lib/auth/session-policy.ts):
// - real activity (tap, click, key, scroll) re-issues the session at most every
//   5 minutes, which is what keeps the 30-minute idle window rolling;
// - after 30 minutes without activity, or at the 2-hour limit, sign out with
//   a message instead of leaving a page whose session has quietly expired;
// - warn once, 5 minutes before the 2-hour limit.
// The server enforces both limits on its own; this just makes them visible.

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { shouldRefresh, timeoutState } from "@/lib/auth/session-policy";
import { DEMO_MODE } from "@/lib/demo-data";

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "touchstart", "wheel", "scroll"] as const;
const CHECK_EVERY_MS = 20 * 1000;

export function SessionTimeouts() {
  const { data: session, status, update } = useSession();
  const lastActivity = useRef(0);
  const lastRefresh = useRef(0);
  const warned = useRef(false);
  const signingOut = useRef(false);
  const wasAuthenticated = useRef(false);
  const authTime = session?.authTime;

  // A session the server has ended (2-hour limit, revoked, expired) shows up
  // as authenticated → unauthenticated: send the user to sign in.
  useEffect(() => {
    if (DEMO_MODE) return;
    if (status === "authenticated") wasAuthenticated.current = true;
    if (status === "unauthenticated" && wasAuthenticated.current && !signingOut.current) {
      window.location.assign("/login?reason=expired");
    }
  }, [status]);

  useEffect(() => {
    if (DEMO_MODE || status !== "authenticated") return;
    const now = Date.now();
    lastActivity.current = now;
    lastRefresh.current = now;

    const end = (reason: "idle" | "expired") => {
      if (signingOut.current) return;
      signingOut.current = true;
      void signOut({ callbackUrl: `/login?reason=${reason}` });
    };

    const onActivity = () => {
      const t = Date.now();
      lastActivity.current = t;
      if (shouldRefresh(lastRefresh.current, t)) {
        lastRefresh.current = t;
        void update(); // re-issues the session cookie with a fresh 30-minute expiry
      }
    };

    const check = () => {
      const state = timeoutState({ authTimeS: authTime, lastActivityMs: lastActivity.current, nowMs: Date.now() });
      if (state === "idle") end("idle");
      else if (state === "max") end("expired");
      else if (state === "warn_max" && !warned.current) {
        warned.current = true;
        toast.warning("For your security you'll be signed out in 5 minutes. You can sign straight back in.");
      }
    };

    for (const ev of ACTIVITY_EVENTS) window.addEventListener(ev, onActivity, { passive: true });
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(check, CHECK_EVERY_MS);
    return () => {
      for (const ev of ACTIVITY_EVENTS) window.removeEventListener(ev, onActivity);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(timer);
    };
  }, [status, authTime, update]);

  return null;
}
