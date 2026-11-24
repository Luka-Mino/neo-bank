# Native App Plan: Moneta on iPhone and Android

> Written 2026-11-24. Goal: pay in shops "like Rain", meaning the Moneta card
> lives in Apple Pay / Google Pay and people tap their phone to pay. This is
> a plan, not a build. Nothing here ships before Dakota answers the card
> questions and the near-launch accounts exist (`PRE-DAKOTA-PLAN.md` §9).

## Why a native app at all

Moneta today is a website (`/app`, mobile-first). From a website, a customer
can still add the card to Apple Pay or Google Pay, by typing the card number
into the phone's wallet; the card screen has those steps (demo mode until
Dakota's card-details viewer ships). A native app adds what a website can't:

| Feature | Website | Native app |
|---|---|---|
| Card in Apple Pay / Google Pay | Typed in by hand | **One tap: "Add to Apple Wallet" / "Add to Google Pay"** (push provisioning) |
| Sign in | Password + code | Face ID / fingerprint |
| Alerts ("You paid $12 at Blue Bottle") | Email | Instant push notifications |
| App Store / Play Store presence | No | Yes |

## What one-tap adding needs (and from whom)

| Need | From | Status |
|---|---|---|
| The card issuer supports **push provisioning**: it generates the encrypted card data Apple/Google need | Dakota and its issuing bank | **Ask Dakota** (A1 Q6) |
| Apple's **In-App Provisioning entitlement** (`com.apple.developer.payment-pass-provisioning`) for our app | Apple, requested with the issuer's backing | After Dakota confirms; Apple reviews each app |
| Google's **Push Provisioning API** access (Google Pay & Wallet Console) | Google, with the issuer's backing | After Dakota confirms |
| Approved **card art** for the wallet: flat, with no drawn chip, hologram, shading, name or number (Visa digital card rules) | Dakota + partner bank + Visa | Design can start any time |
| Apple Developer Program (about $99/yr) and Google Play (one-off $25) accounts, in the company's name | You | Near launch (needs the company, B1) |

Without push provisioning, a native app still helps (biometrics, push
alerts), but adding the card stays manual.

## Two ways to build it

| | **A. Native shell around `/app`** (Capacitor) | **B. Fully native app** (React Native / Expo) |
|---|---|---|
| What it is | The existing `/app` screens inside an iPhone/Android app, plus small native add-ons: wallet provisioning, Face ID, push | New phone screens that call the same Moneta API |
| Reuses | All `/app` screens (already mobile-first) | The API, business rules and tests; screens rebuilt |
| Time to first version | About 2–4 weeks | About 2–3 months |
| Feel | Close to native; scrolling and transitions are the web's | Fully native |
| App Store risk | Apple rejects "just a website in an app" (guideline 4.2). Wallet provisioning, Face ID and push usually clear it, but it's a judgment call | Low |
| Engineering notes | Sessions stay cookie-based in the app's web view. The nonce-based CSP works as-is. The native wallet add-on is the only real new code | Needs token sign-in for the API instead of cookies, and a second UI codebase to maintain |

**Recommendation: start with A.** `/app` is already built mobile-first, so A
gets Moneta into the stores and onto the wallet fastest, with one codebase.
Move to B later if the app outgrows the web view or Apple pushes back.

## Order of work (once the prerequisites land)

1. **Dakota confirms push provisioning** and how it works: an API that returns encrypted card data for Apple and Google, or their own SDK.
2. **Flat card art** submitted to Dakota → bank → Visa (can start now; approval takes time).
3. **Developer accounts** in the company's name; apply for Apple's provisioning entitlement and Google's push-provisioning access with Dakota's backing.
4. **App shell** (option A): `/app` inside Capacitor, sign-in with Face ID / fingerprint unlock, push notifications for card payments.
5. **"Add to Apple Wallet" / "Add to Google Pay"** buttons on the card screen, using the native add-on and Dakota's provisioning data. Keep the typed-in steps as a fallback.
6. TestFlight / internal testing → store review → release.

## Decisions for you

- **D16 Build approach:** A (shell around `/app`, recommended) or B (fully native).
- **D17 When:** before launch (launch with the app) or after (launch on the web first, app next).

## Can start now

- Ask Dakota the card questions (already in the A1 message: Apple/Google Pay, one-tap adding, physical cards, sandbox timing).
- Design the flat wallet card art from the Smoked forest card.
- Everything else waits on Dakota's answers and the company existing.
