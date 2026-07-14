# Security Policy

Moneta handles money and personal financial data. We take security seriously
and welcome responsible disclosure.

## Reporting a vulnerability

Email **security@moneta.example** with a description, reproduction steps, and
impact. Please do not open public issues for security reports, and give us a
reasonable window to remediate before any disclosure.

We aim to acknowledge reports within 3 business days.

## Scope

In scope: the Moneta web application and its APIs. Out of scope:
denial-of-service, social engineering, and findings in third-party
infrastructure we don't control (Dakota, Vercel, Supabase).

## Our controls (summary)

- Passwords hashed with bcrypt (cost 12); TOTP 2FA; magic-link and
  new-device sign-in alerts.
- Server-verified sessions; per-user authorization on every data route.
- Encryption in transit (TLS) and at rest; AES-256-GCM for 2FA secrets.
- Rate limiting, security headers incl. a nonce-based Content-Security-Policy,
  audit logging, and automated dependency scanning.
