export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// Fixed anchor so server and client render identical demo timestamps —
// DEMO_NOW here caused React hydration mismatches (server renders minutes
// before the client). Bump occasionally to keep relative labels fresh.
const DEMO_NOW = new Date("2026-07-10T09:00:00-04:00").getTime();
/** The demo's fixed "today", for screens that bucket by date (e.g. Insights). */
export const DEMO_TODAY = new Date(DEMO_NOW);

export const DEMO_CUSTOMER = { kycStatus: "active" as const, fullName: "Alex Demo" };

// The demo user's accounts: just named accounts (no checking/savings).
export const DEMO_ACCOUNTS = [
  {
    id: "acct-checking",
    accountType: "checking" as const,
    nickname: "Main",
    accountNumber: "40123456789012",
    currency: "USD",
    balance: "8250.18",
    status: "active" as const,
    isPrimary: true,
    createdAt: new Date(DEMO_NOW - 90 * 86400000).toISOString(),
  },
  {
    id: "acct-savings",
    accountType: "savings" as const,
    nickname: "Rainy day",
    accountNumber: "40987654321098",
    currency: "USD",
    balance: "3208.14",
    status: "active" as const,
    isPrimary: false,
    createdAt: new Date(DEMO_NOW - 60 * 86400000).toISOString(),
  },
  {
    id: "acct-vacation",
    accountType: "savings" as const,
    nickname: "Vacation fund",
    accountNumber: "40555000111222",
    currency: "USD",
    balance: "1000.00",
    status: "active" as const,
    isPrimary: false,
    createdAt: new Date(DEMO_NOW - 14 * 86400000).toISOString(),
  },
];


// Every account has its own virtual card, and each card only spends its own
// account's money (SIDE-ACCOUNTS-PLAN.md). One is frozen to show that state.
export const DEMO_CARDS = [
  {
    id: "card-main",
    userId: "demo-user",
    accountId: "acct-checking",
    cardType: "virtual" as const,
    last4: "7891",
    status: "active" as const,
    nickname: null,
    expMonth: 8,
    expYear: 2029,
    network: "visa" as const,
    createdAt: new Date(DEMO_NOW - 30 * 86400000).toISOString(),
  },
  {
    id: "card-rainy-day",
    userId: "demo-user",
    accountId: "acct-savings",
    cardType: "virtual" as const,
    last4: "4422",
    status: "frozen" as const,
    nickname: null,
    expMonth: 11,
    expYear: 2028,
    network: "visa" as const,
    createdAt: new Date(DEMO_NOW - 200 * 86400000).toISOString(),
  },
  {
    id: "card-vacation",
    userId: "demo-user",
    accountId: "acct-vacation",
    cardType: "virtual" as const,
    last4: "3056",
    status: "active" as const,
    nickname: null,
    expMonth: 2,
    expYear: 2030,
    network: "visa" as const,
    createdAt: new Date(DEMO_NOW - 25 * 86400000).toISOString(),
  },
];

export const DEMO_TRANSACTIONS = [
  { id: "tx-1", accountId: "acct-checking", txType: "onramp", sourceAmount: "5000.00", sourceAsset: "USD", destinationAsset: "USDC", status: "completed", createdAt: new Date(DEMO_NOW - 2 * 86400000).toISOString(), updatedAt: new Date(DEMO_NOW - 2 * 86400000).toISOString() },
  { id: "tx-2", category: "food", accountId: "acct-checking", txType: "send", sourceAmount: "250.00", sourceAsset: "USDC", destinationAsset: "USDC", status: "completed", createdAt: new Date(DEMO_NOW - 5 * 86400000).toISOString(), updatedAt: new Date(DEMO_NOW - 5 * 86400000).toISOString() },
  { id: "tx-3", category: "bills", accountId: "acct-checking", txType: "offramp", sourceAmount: "1000.00", sourceAsset: "USDC", destinationAsset: "USD", status: "completed", createdAt: new Date(DEMO_NOW - 7 * 86400000).toISOString(), updatedAt: new Date(DEMO_NOW - 7 * 86400000).toISOString() },
  { id: "tx-4", accountId: "acct-checking", txType: "onramp", sourceAmount: "3000.00", sourceAsset: "USD", destinationAsset: "USDC", status: "pending", createdAt: new Date(DEMO_NOW - 1 * 86400000).toISOString(), updatedAt: new Date(DEMO_NOW - 1 * 86400000).toISOString() },
  { id: "tx-5", category: "shopping", accountId: "acct-savings", txType: "send", sourceAmount: "75.50", sourceAsset: "USDC", destinationAsset: "USDC", status: "completed", createdAt: new Date(DEMO_NOW - 14 * 86400000).toISOString(), updatedAt: new Date(DEMO_NOW - 14 * 86400000).toISOString() },
  { id: "tx-6", accountId: "acct-savings", txType: "onramp", sourceAmount: "2000.00", sourceAsset: "USD", destinationAsset: "USDC", status: "completed", createdAt: new Date(DEMO_NOW - 20 * 86400000).toISOString(), updatedAt: new Date(DEMO_NOW - 20 * 86400000).toISOString() },
  { id: "tx-7", accountId: "acct-vacation", txType: "internal_in", sourceAmount: "500.00", sourceAsset: "USD", destinationAsset: "USD", status: "completed", createdAt: new Date(DEMO_NOW - 25 * 86400000).toISOString(), updatedAt: new Date(DEMO_NOW - 25 * 86400000).toISOString() },
];

// People you can Send money to (P2P). For /send only.
// Transfer Out uses DEMO_LINKED_BANKS instead.
export const DEMO_RECIPIENTS = [
  { id: "r-1", name: "Alice Johnson", dakotaRecipientId: "dr-1", createdAt: new Date(DEMO_NOW - 30 * 86400000).toISOString() },
  { id: "r-2", name: "Bob Smith", dakotaRecipientId: "dr-2", createdAt: new Date(DEMO_NOW - 15 * 86400000).toISOString() },
  { id: "r-3", name: "Carol Williams", dakotaRecipientId: "dr-3", createdAt: new Date(DEMO_NOW - 5 * 86400000).toISOString() },
];

// External bank accounts the user has linked. Used as destinations for
// "Withdraw to bank" (offramp / ACH-out / wire). Distinct from recipients,
// which are people for P2P sends.
export const DEMO_LINKED_BANKS = [
  {
    id: "bank-1",
    dakotaRecipientId: "dr-bank-1",
    bankName: "Chase",
    accountHolder: "Alex Demo",
    accountType: "checking" as const,
    last4: "4821",
    createdAt: new Date(DEMO_NOW - 120 * 86400000).toISOString(),
  },
  {
    id: "bank-2",
    dakotaRecipientId: "dr-bank-2",
    bankName: "Ally Bank",
    accountHolder: "Alex Demo",
    accountType: "savings" as const,
    last4: "7034",
    createdAt: new Date(DEMO_NOW - 45 * 86400000).toISOString(),
  },
];

export const DEMO_BANK_DETAILS = {
  bank_name: "Evolve Bank & Trust",
  account_holder_name: "Moneta Inc.",
  aba_routing_number: "084009519",
  account_number: "9876543210",
};

export const DEMO_SESSION = {
  user: { name: "Alex Demo", email: "alex@demo.com" },
};

// Team roster for the demo org — shows the full spread of role presets.
export const DEMO_TEAM = [
  { id: "m1", userId: "u1", name: "Alex Demo", email: "alex@demo.com", role: "owner", canApprove: true, canMoveMoney: true, canExport: true, status: "active", createdAt: "2026-01-14T09:00:00Z" },
  { id: "m2", userId: "u2", name: "Jordan Lee", email: "jordan@demo.com", role: "admin", canApprove: true, canMoveMoney: true, canExport: true, status: "active", createdAt: "2026-02-02T09:00:00Z" },
  { id: "m3", userId: "u3", name: "Sam Rivera", email: "sam@demo.com", role: "member", canApprove: false, canMoveMoney: true, canExport: false, status: "active", createdAt: "2026-03-18T09:00:00Z" },
  { id: "m4", userId: "u4", name: "Priya Patel", email: "priya@demo.com", role: "member", canApprove: false, canMoveMoney: false, canExport: true, status: "active", createdAt: "2026-04-09T09:00:00Z" },
  { id: "m5", userId: "u5", name: "Chris Wong", email: "chris@demo.com", role: "viewer", canApprove: false, canMoveMoney: false, canExport: false, status: "invited", createdAt: "2026-08-19T09:00:00Z" },
];

export const DEMO_APPROVALS = [
  { id: "ar1", actionType: "transfer.internal", amount: "25000.00", asset: "USD", status: "pending", requiredApprovals: 2, approvalsCount: 1, requestedByName: "Sam Rivera", createdAt: "2026-08-23T14:10:00Z", note: "Q3 vendor float — Operating → Payroll" },
  { id: "ar2", actionType: "transfer.external", amount: "8500.00", asset: "USD", status: "pending", requiredApprovals: 1, approvalsCount: 0, requestedByName: "Priya Patel", createdAt: "2026-08-24T08:30:00Z", note: "Supplier payout — Acme GmbH (SEPA)" },
  { id: "ar3", actionType: "recipient.destination.change", amount: null, asset: null, status: "pending", requiredApprovals: 2, approvalsCount: 0, requestedByName: "Sam Rivera", createdAt: "2026-08-24T09:05:00Z", note: "New payout address for Contractor #4421" },
];

// In-app notifications for the /app bell (same shape as GET /api/notifications).
export const DEMO_NOTIFICATIONS = [
  { id: "n-1", type: "transaction", title: "Deposit on its way", body: "Your $3,000.00 deposit is processing and should arrive within 1 business day.", actionUrl: "/app", readAt: null as string | null, createdAt: new Date(DEMO_NOW - 1 * 86400000).toISOString() },
  { id: "n-2", type: "card_update", title: "Your Moneta card is ready", body: "Your virtual Visa debit card is active. You can use it online right away.", actionUrl: "/app/card", readAt: null as string | null, createdAt: new Date(DEMO_NOW - 3 * 86400000).toISOString() },
  { id: "n-3", type: "security", title: "New sign-in", body: "Chrome on macOS signed in to your account. If this wasn't you, change your password.", actionUrl: "/app/more/settings", readAt: new Date(DEMO_NOW - 6 * 86400000).toISOString() as string | null, createdAt: new Date(DEMO_NOW - 7 * 86400000).toISOString() },
];
