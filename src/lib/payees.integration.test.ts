// Adding a payee and their bank details through the real routes, connected as
// the restricted app role, so row-level security is in force. These routes
// aren't orgScoped (they call Dakota mid-way), so every DB step must run in
// its own withOrg; this test fails if one doesn't. Dakota and sign-in are
// stubbed. Gated like the other integration tests (INTEGRATION=1).
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const RUN = process.env.INTEGRATION === "1";

let session: { user: { id: string; email: string; orgId?: string } } | null = null;
vi.mock("@/lib/auth/config", () => ({ auth: async () => session }));
vi.mock("@/lib/dakota/recipients", () => ({
  createRecipient: async () => ({ id: `drec_${Date.now()}` }),
  createDestination: async () => ({ id: `ddst_${Date.now()}` }),
}));

function req(url: string, body: unknown) {
  return new NextRequest(`http://localhost${url}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": `10.7.${Math.floor(Math.random() * 250)}.1` },
    body: JSON.stringify(body),
  });
}

describe.skipIf(!RUN)("adding a payee and bank details under RLS (integration)", () => {
  let sys: typeof import("@/lib/db").systemDb;
  let schema: typeof import("@/lib/db/schema");
  const stamp = Date.now();
  const ids: { user?: string; org?: string; recipient?: string } = {};

  beforeAll(async () => {
    ({ systemDb: sys } = await import("@/lib/db"));
    schema = await import("@/lib/db/schema");
    const [u] = await sys
      .insert(schema.users)
      .values({ email: `itest-payee-${stamp}@moneta.test`, passwordHash: "x", fullName: "Payee Test" })
      .returning();
    const [o] = await sys
      .insert(schema.organizations)
      .values({ name: "Payee Org", type: "personal", createdBy: u.id, personalForUserId: u.id })
      .returning();
    await sys.insert(schema.dakotaCustomers).values({
      orgId: o.id,
      userId: u.id,
      dakotaCustomerId: `dcus_${stamp}`,
      kycStatus: "active",
    });
    ids.user = u.id;
    ids.org = o.id;
    session = { user: { id: u.id, email: "payee@moneta.test", orgId: o.id } };
  });

  afterAll(async () => {
    const { eq } = await import("drizzle-orm");
    if (!ids.org) return;
    await sys.delete(schema.destinations).where(eq(schema.destinations.orgId, ids.org));
    await sys.delete(schema.recipients).where(eq(schema.recipients.orgId, ids.org));
    await sys.delete(schema.dakotaCustomers).where(eq(schema.dakotaCustomers.orgId, ids.org));
    await sys.delete(schema.organizations).where(eq(schema.organizations.id, ids.org));
    if (ids.user) await sys.delete(schema.users).where(eq(schema.users.id, ids.user));
  });

  it("creates the recipient in the caller's org", async () => {
    const { POST } = await import("@/app/api/recipients/route");
    const res = await POST(
      req("/api/recipients", {
        name: "Payee Test",
        address: { street1: "1 Main St", city: "Austin", region: "TX", postalCode: "78701", country: "US" },
      })
    );
    expect(res.status).toBe(201);
    const { data } = await res.json();
    expect(data.orgId).toBe(ids.org);
    ids.recipient = data.id;
  });

  it("adds bank details to that recipient", async () => {
    const { POST } = await import("@/app/api/recipients/[id]/destinations/route");
    const res = await POST(
      req(`/api/recipients/${ids.recipient}/destinations`, {
        destinationType: "fiat_us",
        name: "Chase ··6789",
        abaRoutingNumber: "021000021",
        accountNumber: "123456789",
        accountType: "checking",
        accountHolderName: "Payee Test",
        bankName: "Chase",
        accountHolderAddress: { street1: "1 Main St", city: "Austin", region: "TX", postalCode: "78701", country: "US" },
        capabilities: ["ach"],
      }),
      { params: Promise.resolve({ id: ids.recipient! }) }
    );
    expect(res.status).toBe(201);
    const { data } = await res.json();
    expect(data).toMatchObject({ orgId: ids.org, recipientId: ids.recipient });
  });

  it("refuses bank details on another org's recipient (404, not a leak)", async () => {
    const { POST } = await import("@/app/api/recipients/[id]/destinations/route");
    session = { user: { id: ids.user!, email: "payee@moneta.test", orgId: "00000000-0000-4000-8000-000000000000" } };
    const res = await POST(
      req(`/api/recipients/${ids.recipient}/destinations`, {
        destinationType: "crypto",
        name: "x",
        cryptoAddress: "0x0000000000000000000000000000000000000001",
      }),
      { params: Promise.resolve({ id: ids.recipient! }) }
    );
    expect(res.status).toBe(404);
  });
});
