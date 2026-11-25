// Browser-side error monitoring. No-op until NEXT_PUBLIC_SENTRY_DSN is set.
import * as Sentry from "@sentry/nextjs";
import { scrubBreadcrumb, scrubEvent } from "@/lib/sentry-scrub";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    // Sentry 11 drops this option and collects bodies, headers and cookies by
    // default: on upgrade, switch those off in `dataCollection` (BACKLOG.md).
    sendDefaultPii: false,
    // Money UI: strip tokens (magic-link, reset, invite, the Cards.js
    // session), emails, credentials and card/account numbers before anything
    // leaves the browser (src/lib/sentry-scrub.ts).
    beforeSend: (event) => scrubEvent(event),
    beforeSendTransaction: (event) => scrubEvent(event),
    beforeBreadcrumb: (breadcrumb) => scrubBreadcrumb(breadcrumb),
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
