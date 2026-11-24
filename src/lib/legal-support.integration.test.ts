// Integration tests for plan 1c.2 (terms acceptance at sign-up) and 1c.3
// (support requests), run through the real route handlers against a REAL
// Postgres migrated through 0020. Gated like the other integration tests:
// INTEGRATION=1 with DATABASE_URL pointing at a disposable DB.
//
// Sign-in and email are stubbed: the session is whatever `session` holds,
// and outgoing mail is captured instead of sent.
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const RUN = process.env.INTEGRATION === "1";

type TestSession = { user: { id: string; email: string; name?: string; orgId?: string } } | null;
let session: TestSession = null;
vi.mock("@/lib/auth/config", () => ({ auth: async () => session }));

const sent: { to: string; subject: string; body: string }[] = [];
vi.mock("@/lib/email", () => ({
  sendVerificationEmail: async () => undefined,
  sendNotificationEmail: async (p: { to: string; subject: string; body: string }) => {
    sent.push(p);
  },
}));

function req(url: string, method: string, body?: unknown) {
  return new NextRequest(`http://localhost${url}`, {
    method,
    headers: { "content-type": "application/json", "x-real-ip": `10.9.${Math.floor(Math.random() * 250)}.1` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe.skipIf(!RUN)("sign-up terms acceptance and support requests (integration)", () => {
  // Fixtures and checks use systemDb (bypasses row-level security); the routes
  // under test use their own connections, as in production.
  let db: typeof import("@/lib/db").systemDb;
  let schema: typeof import("@/lib/db/schema");
  let LEGAL_DOCS: typeof import("@/lib/legal").LEGAL_DOCS;
  let register: typeof import("@/app/api/register/route").POST;
  let support: typeof import("@/app/api/support/route");
  const email = `itest-legal-${Date.now()}@moneta.test`;
  const ids: { user?: string; org?: string; otherUser?: string; otherOrg?: string; otherTx?: string } = {};

  const signUp = {
    fullName: "Grace Hopper",
    email,
    password: "Compiler1952x",
    confirmPassword: "Compiler1952x",
  };

  beforeAll(async () => {
    ({ systemDb: db } = await import("@/lib/db"));
    schema = await import("@/lib/db/schema");
    ({ LEGAL_DOCS } = await import("@/lib/legal"));
    ({ POST: register } = await import("@/app/api/register/route"));
    support = await import("@/app/api/support/route");
  });

  afterAll(async () => {
    const { eq } = await import("drizzle-orm");
    // The signed-up user and their org stay behind: their audit rows are
    // append-only (migration 0009 blocks UPDATE/DELETE, including the FK's
    // SET NULL), which is the point. Their emails are itest-*, in a
    // disposable DB. Everything else is removed.
    if (ids.user) await db.delete(schema.supportRequests).where(eq(schema.supportRequests.userId, ids.user));
    if (ids.otherTx) await db.delete(schema.transactions).where(eq(schema.transactions.id, ids.otherTx));
    if (ids.otherOrg) await db.delete(schema.organizations).where(eq(schema.organizations.id, ids.otherOrg));
    if (ids.otherUser) await db.delete(schema.users).where(eq(schema.users.id, ids.otherUser));
  });

  it("refuses a sign-up that didn't accept the Terms, and creates no user", async () => {
    const { eq } = await import("drizzle-orm");
    const res = await register(req("/api/register", "POST", { ...signUp, acceptTerms: false }));
    expect(res.status).toBe(400);
    const rows = await db.select().from(schema.users).where(eq(schema.users.email, email));
    expect(rows).toHaveLength(0);
  });

  it("records the server's Terms and Privacy versions on sign-up, with an audit entry", async () => {
    const { and, eq } = await import("drizzle-orm");
    const before = Date.now();
    const res = await register(req("/api/register", "POST", { ...signUp, acceptTerms: true }));
    expect(res.status).toBe(201);

    const [u] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    ids.user = u.id;
    ids.org = u.activeOrgId!;
    expect(u.termsVersion).toBe(LEGAL_DOCS.terms.version);
    expect(u.privacyVersion).toBe(LEGAL_DOCS.privacy.version);
    expect(u.legalAcceptedAt!.getTime()).toBeGreaterThanOrEqual(before - 1000);

    const audit = await db
      .select()
      .from(schema.auditLog)
      .where(and(eq(schema.auditLog.actorId, u.id), eq(schema.auditLog.action, "legal.accepted")));
    expect(audit).toHaveLength(1);
    expect(audit[0].metadata).toMatchObject({ termsVersion: LEGAL_DOCS.terms.version, context: "sign_up" });
  });

  it("saves a support request, notifies the user, and escapes the inbox copy", async () => {
    const { eq } = await import("drizzle-orm");
    process.env.SUPPORT_EMAIL = "support@moneta.test";
    session = { user: { id: ids.user!, email, name: "Grace Hopper", orgId: ids.org } };

    const res = await support.POST(
      req("/api/support", "POST", {
        category: "complaint",
        subject: "Withdrawal <script>alert(1)</script>",
        message: "It's been three days.\nStill nothing.",
      })
    );
    expect(res.status).toBe(201);
    const { data } = await res.json();
    expect(data.reference).toMatch(/^SUP-[2-9A-HJKMNP-Z]{6}$/);

    const [row] = await db.select().from(schema.supportRequests).where(eq(schema.supportRequests.id, data.id));
    expect(row).toMatchObject({ userId: ids.user, orgId: ids.org, category: "complaint", status: "open" });

    const notes = await db.select().from(schema.notifications).where(eq(schema.notifications.userId, ids.user!));
    expect(notes.some((n) => n.title.includes(data.reference))).toBe(true);

    const mail = sent.at(-1)!;
    expect(mail.to).toBe("support@moneta.test");
    expect(mail.subject).toContain(data.reference);
    expect(mail.body).not.toContain("<script>");
    expect(mail.body).toContain("&lt;script&gt;");
  });

  it("won't link a request to another org's payment", async () => {
    const [other] = await db
      .insert(schema.users)
      .values({ email: `itest-other-${Date.now()}@moneta.test`, passwordHash: "x", fullName: "Other" })
      .returning();
    ids.otherUser = other.id;
    const [org] = await db
      .insert(schema.organizations)
      .values({ name: "Other Org", type: "personal", createdBy: other.id, personalForUserId: other.id })
      .returning();
    ids.otherOrg = org.id;
    const [tx] = await db
      .insert(schema.transactions)
      .values({
        userId: other.id,
        orgId: org.id,
        dakotaTxId: `itest-${Date.now()}`,
        txType: "deposit",
        status: "completed",
      })
      .returning();
    ids.otherTx = tx.id;

    const res = await support.POST(
      req("/api/support", "POST", {
        category: "complaint",
        subject: "Not my payment",
        message: "Trying to attach someone else's transaction.",
        transactionId: tx.id,
      })
    );
    expect(res.status).toBe(404);
  });

  it("lists only the caller's own requests", async () => {
    const res = await support.GET(req("/api/support", "GET"));
    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data.data.length).toBeGreaterThan(0);

    session = { user: { id: ids.otherUser!, email: "other@moneta.test", orgId: ids.otherOrg } };
    const other = await (await support.GET(req("/api/support", "GET"))).json();
    expect(other.data.data).toHaveLength(0);
  });

  it("the database refuses a category outside the CHECK list", async () => {
    await expect(
      db.insert(schema.supportRequests).values({
        reference: "SUP-ZZZZZZ",
        userId: ids.user!,
        category: "refund",
        subject: "x",
        message: "x",
      })
    ).rejects.toThrow();
  });
});
