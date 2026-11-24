// Scrubbing for error reports (PRE-DAKOTA-PLAN C4). Runs in Sentry's
// beforeSend / beforeSendTransaction / beforeBreadcrumb on the server and in
// the browser, so secrets and personal data never leave the app:
//   - URL query values that carry secrets: magic-link, reset, verify and
//     invite tokens, the Cards.js `session`, codes, keys, signatures;
//   - Authorization / cookie / signature headers, cookies, request bodies;
//   - email addresses and bearer tokens inside any string;
//   - long digit runs (card, account and routing numbers) in messages;
//   - user details except the opaque id.
// Pure functions with loose types so it has no dependency on the Sentry SDK.

const SECRET_PARAMS = new Set([
  "token",
  "session",
  "code",
  "otp",
  "totp",
  "password",
  "secret",
  "key",
  "apikey",
  "api_key",
  "access_token",
  "refresh_token",
  "id_token",
  "signature",
  "sig",
  "email",
  "callbackurl",
]);
const SECRET_HEADERS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "x-dakota-signature",
  "x-signature",
  "stripe-signature",
  "x-application-token",
  "proxy-authorization",
]);

const REDACTED = "[redacted]";
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const BEARER = /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi;
const LONG_DIGITS = /\d{6,}/g;
const MAX_DEPTH = 6;

/** Redact secret query values in a URL or a bare query string. */
export function scrubUrl(input: string): string {
  if (!input) return input;
  const scrubQuery = (q: string) =>
    q
      .split("&")
      .map((pair) => {
        const eq = pair.indexOf("=");
        if (eq === -1) return pair;
        const name = decodeURIComponent(pair.slice(0, eq).replace(/\+/g, " ")).toLowerCase();
        return SECRET_PARAMS.has(name) ? `${pair.slice(0, eq)}=${REDACTED}` : pair;
      })
      .join("&");

  const hashAt = input.indexOf("#");
  const base = hashAt === -1 ? input : input.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : input.slice(hashAt);
  const qAt = base.indexOf("?");
  const looksLikeBareQuery = qAt === -1 && base.includes("=") && !base.includes("/");
  const scrubbed =
    qAt !== -1
      ? `${base.slice(0, qAt + 1)}${scrubQuery(base.slice(qAt + 1))}`
      : looksLikeBareQuery
        ? scrubQuery(base)
        : base;
  return scrubString(scrubbed) + (hash ? "#[redacted]" : "");
}

// Secret query values inside free text, e.g. "GET /magic?token=abc".
const INLINE_PARAM = new RegExp(`([?&](?:${[...SECRET_PARAMS].join("|")})=)[^&\\s#"']+`, "gi");

/** Remove emails, bearer credentials and inline secret query values from text. */
export function scrubString(text: string): string {
  if (!text) return text;
  return text
    .replace(BEARER, "$1 [redacted]")
    .replace(INLINE_PARAM, "$1[redacted]")
    .replace(EMAIL, "[email]");
}

/** Messages may also carry card, account or routing numbers. */
export function scrubMessage(text: string): string {
  return scrubString(text).replace(LONG_DIGITS, "[digits]");
}

function scrubDeep(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return "[truncated]";
  if (typeof value === "string") return scrubUrlIfUrl(value);
  if (Array.isArray(value)) return value.map((v) => scrubDeep(v, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const lower = k.toLowerCase();
      out[k] = SECRET_PARAMS.has(lower) || SECRET_HEADERS.has(lower) ? REDACTED : scrubDeep(v, depth + 1);
    }
    return out;
  }
  return value;
}

function scrubUrlIfUrl(s: string): string {
  return /^(https?:\/\/|\/)[^\s]*\?/.test(s) ? scrubUrl(s) : scrubString(s);
}

type Loose = Record<string, unknown>;

/** Sentry `beforeSend` / `beforeSendTransaction`. Mutates and returns the event. */
export function scrubEvent<T>(event: T): T {
  const e = event as Loose;

  const req = e.request as Loose | undefined;
  if (req) {
    if (typeof req.url === "string") req.url = scrubUrl(req.url);
    if (typeof req.query_string === "string") req.query_string = scrubUrl(req.query_string);
    else if (req.query_string && typeof req.query_string === "object") req.query_string = scrubDeep(req.query_string);
    delete req.cookies;
    delete req.data;
    if (req.headers && typeof req.headers === "object") {
      const headers = req.headers as Loose;
      for (const name of Object.keys(headers)) {
        if (SECRET_HEADERS.has(name.toLowerCase())) headers[name] = REDACTED;
      }
    }
  }

  const user = e.user as Loose | undefined;
  if (user) e.user = user.id ? { id: user.id } : undefined;

  if (typeof e.message === "string") e.message = scrubMessage(e.message);
  if (typeof e.transaction === "string") e.transaction = scrubUrl(e.transaction);

  const exception = e.exception as { values?: Loose[] } | undefined;
  for (const ex of exception?.values ?? []) {
    if (typeof ex.value === "string") ex.value = scrubMessage(ex.value);
  }

  if (e.extra) e.extra = scrubDeep(e.extra);
  if (e.contexts) e.contexts = scrubDeep(e.contexts);
  if (e.tags) e.tags = scrubDeep(e.tags);

  const crumbs = e.breadcrumbs as Loose[] | { values?: Loose[] } | undefined;
  const list = Array.isArray(crumbs) ? crumbs : crumbs?.values;
  if (list) list.forEach((c) => scrubBreadcrumb(c));

  return event;
}

/** Sentry `beforeBreadcrumb`. Mutates and returns the breadcrumb. */
export function scrubBreadcrumb<T>(breadcrumb: T): T {
  const b = breadcrumb as Loose;
  if (typeof b.message === "string") b.message = scrubMessage(b.message);
  if (b.data && typeof b.data === "object") {
    const data = b.data as Loose;
    for (const field of ["url", "from", "to"]) {
      if (typeof data[field] === "string") data[field] = scrubUrl(data[field] as string);
    }
    b.data = scrubDeep(data);
  }
  return breadcrumb;
}
