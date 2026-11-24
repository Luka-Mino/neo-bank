import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/dakota/cards", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/dakota/cards")>();
  return {
    ...actual,
    getCardsCapability: vi.fn(),
    createCardholder: vi.fn(),
    getCardholder: vi.fn(),
    findCardholderByExternalId: vi.fn(),
    getCardEnablement: vi.fn(),
    createCard: vi.fn(),
    setCardStatus: vi.fn(),
  };
});

import * as cardsApi from "@/lib/dakota/cards";
import { DakotaApiError } from "@/lib/dakota/client";
import {
  CardIssuerNotReadyError,
  DakotaCardProvider,
  type DakotaCardDeps,
  type IssueCardRequest,
} from "@/lib/card-issuer";

const api = vi.mocked(cardsApi);

const req: IssueCardRequest = {
  userId: "user-1",
  accountId: "acct-1",
  cardType: "virtual",
  nickname: "Virtual card",
  cardholder: { name: "Alex", email: "alex@example.com" },
};

function deps(overrides: Partial<DakotaCardDeps> = {}): DakotaCardDeps & {
  saveCardholderId: ReturnType<typeof vi.fn>;
} {
  return {
    resolveIds: vi.fn(async () => ({
      customerId: "cus_1",
      walletId: "wal_1",
      cardholderId: null,
    })),
    saveCardholderId: vi.fn(async () => {}),
    ...overrides,
  } as DakotaCardDeps & { saveCardholderId: ReturnType<typeof vi.fn> };
}

async function reasonOf(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (e) {
    if (e instanceof CardIssuerNotReadyError) return e.reason;
    throw e;
  }
  return "no-error";
}

describe("DakotaCardProvider.issueCard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.getCardsCapability.mockResolvedValue({
      capability: "cards",
      status: "available",
      requirements: [],
    });
    api.createCardholder.mockResolvedValue({ id: "ch_1", customer_id: "cus_1", status: "active" });
    api.getCardEnablement.mockResolvedValue({ state: "active" });
    api.createCard.mockResolvedValue({
      id: "card_1",
      cardholder_id: "ch_1",
      customer_id: "cus_1",
      wallet_id: "wal_1",
      status: "pending",
      version: 1,
      last4: null,
    });
  });

  it("refuses before onboarding is complete", async () => {
    const p = new DakotaCardProvider(deps({ resolveIds: vi.fn(async () => null) }));
    expect(await reasonOf(p.issueCard(req))).toBe("not_onboarded");
  });

  it("asks for card terms when the capability needs action", async () => {
    api.getCardsCapability.mockResolvedValue({
      capability: "cards",
      status: "action_required",
      requirements: [],
    });
    expect(await reasonOf(new DakotaCardProvider(deps()).issueCard(req))).toBe("terms_required");
  });

  it("creates and saves a cardholder, then waits while it is pending", async () => {
    api.createCardholder.mockResolvedValue({ id: "ch_1", customer_id: "cus_1", status: "pending" });
    const d = deps();
    expect(await reasonOf(new DakotaCardProvider(d).issueCard(req))).toBe("cardholder_pending");
    expect(api.createCardholder).toHaveBeenCalledWith("cus_1", { external_id: "user-1" });
    expect(d.saveCardholderId).toHaveBeenCalledWith("user-1", "ch_1");
    expect(api.createCard).not.toHaveBeenCalled();
  });

  it("reuses an existing cardholder on cardholder-already-exists", async () => {
    api.createCardholder.mockRejectedValue(
      new DakotaApiError(409, "https://docs.dakota.xyz/api-reference/errors#cardholder-already-exists", "x")
    );
    api.findCardholderByExternalId.mockResolvedValue({
      id: "ch_existing",
      customer_id: "cus_1",
      status: "active",
    });
    const d = deps();
    const card = await new DakotaCardProvider(d).issueCard(req);
    expect(d.saveCardholderId).toHaveBeenCalledWith("user-1", "ch_existing");
    expect(api.createCard).toHaveBeenCalledWith("cus_1", expect.objectContaining({ cardholder_id: "ch_existing" }));
    expect(card.externalCardId).toBe("card_1");
  });

  it("stops when the wallet isn't enabled for cards", async () => {
    api.getCardEnablement.mockResolvedValue({ state: "not_enabled" });
    expect(await reasonOf(new DakotaCardProvider(deps()).issueCard(req))).toBe("wallet_not_enabled");
    expect(api.createCard).not.toHaveBeenCalled();
  });

  it("issues a pending card with no expiry and the Dakota version", async () => {
    const card = await new DakotaCardProvider(deps()).issueCard(req);
    expect(card).toMatchObject({
      externalCardId: "card_1",
      last4: null,
      expMonth: null,
      expYear: null,
      status: "pending",
      issuerVersion: 1,
      network: "visa",
    });
    expect(api.createCard).toHaveBeenCalledWith("cus_1", {
      cardholder_id: "ch_1",
      wallet_id: "wal_1",
      nickname: "Virtual card",
      external_id: "acct-1",
    });
  });
});

describe("DakotaCardProvider: a card spends its own account (side accounts)", () => {
  it("resolves the wallet from the card's account, not just the user", async () => {
    api.getCardsCapability.mockResolvedValue({ capability: "cards", status: "available", requirements: [] });
    api.createCardholder.mockResolvedValue({ id: "ch_1", customer_id: "cus_1", status: "active" });
    api.getCardEnablement.mockResolvedValue({ state: "active" });
    api.createCard.mockResolvedValue({
      id: "card_2",
      cardholder_id: "ch_1",
      customer_id: "cus_1",
      wallet_id: "wal_side",
      status: "pending",
      version: 1,
      last4: null,
    });
    const resolveIds = vi.fn(async () => ({ customerId: "cus_1", walletId: "wal_side", cardholderId: null }));
    const p = new DakotaCardProvider(deps({ resolveIds }));
    await p.issueCard({ ...req, accountId: "acct-side" });
    expect(resolveIds).toHaveBeenCalledWith(req.userId, "acct-side");
    expect(api.createCard.mock.calls.at(-1)?.[1]).toMatchObject({ wallet_id: "wal_side" });
  });
});
