export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const DEMO_CUSTOMER = { kycStatus: "active" as const, fullName: "Alex Demo" };

// User's banking accounts. Aggregate balance is checking + savings + vacation.
export const DEMO_ACCOUNTS = [
  {
    id: "acct-checking",
    accountType: "checking" as const,
    nickname: "Checking",
    accountNumber: "40123456789012",
    currency: "USD",
    balance: "8250.18",
    status: "active" as const,
    isPrimary: true,
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: "acct-savings",
    accountType: "savings" as const,
    nickname: "Savings",
    accountNumber: "40987654321098",
    currency: "USD",
    balance: "3208.14",
    status: "active" as const,
    isPrimary: false,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
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
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

export const DEMO_BALANCE = {
  totalUsd: DEMO_ACCOUNTS.reduce(
    (s, a) => s + Number(a.balance),
    0
  ).toFixed(2),
};

// Cards: one virtual on Checking, one physical on Savings.
export const DEMO_CARDS = [
  {
    id: "card-virtual",
    userId: "demo-user",
    accountId: "acct-checking",
    cardType: "virtual" as const,
    last4: "7891",
    status: "active" as const,
    nickname: "Virtual",
    expMonth: 8,
    expYear: 2029,
    network: "visa" as const,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "card-physical",
    userId: "demo-user",
    accountId: "acct-savings",
    cardType: "physical" as const,
    last4: "4422",
    status: "frozen" as const,
    nickname: "Travel",
    expMonth: 11,
    expYear: 2028,
    network: "visa" as const,
    createdAt: new Date(Date.now() - 200 * 86400000).toISOString(),
  },
];

export const DEMO_TRANSACTIONS = [
  { id: "tx-1", accountId: "acct-checking", txType: "onramp", sourceAmount: "5000.00", sourceAsset: "USD", destinationAsset: "USDC", status: "completed", createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "tx-2", accountId: "acct-checking", txType: "send", sourceAmount: "250.00", sourceAsset: "USDC", destinationAsset: "USDC", status: "completed", createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "tx-3", accountId: "acct-checking", txType: "offramp", sourceAmount: "1000.00", sourceAsset: "USDC", destinationAsset: "USD", status: "completed", createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: "tx-4", accountId: "acct-checking", txType: "onramp", sourceAmount: "3000.00", sourceAsset: "USD", destinationAsset: "USDC", status: "pending", createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: "tx-5", accountId: "acct-savings", txType: "send", sourceAmount: "75.50", sourceAsset: "USDC", destinationAsset: "USDC", status: "completed", createdAt: new Date(Date.now() - 14 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 14 * 86400000).toISOString() },
  { id: "tx-6", accountId: "acct-savings", txType: "onramp", sourceAmount: "2000.00", sourceAsset: "USD", destinationAsset: "USDC", status: "completed", createdAt: new Date(Date.now() - 20 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: "tx-7", accountId: "acct-vacation", txType: "internal_in", sourceAmount: "500.00", sourceAsset: "USD", destinationAsset: "USD", status: "completed", createdAt: new Date(Date.now() - 25 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 25 * 86400000).toISOString() },
];

// People you can Send money to (P2P). For /send only.
// Transfer Out uses DEMO_LINKED_BANKS instead.
export const DEMO_RECIPIENTS = [
  { id: "r-1", name: "Alice Johnson", dakotaRecipientId: "dr-1", createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: "r-2", name: "Bob Smith", dakotaRecipientId: "dr-2", createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: "r-3", name: "Carol Williams", dakotaRecipientId: "dr-3", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
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
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
  },
  {
    id: "bank-2",
    dakotaRecipientId: "dr-bank-2",
    bankName: "Ally Bank",
    accountHolder: "Alex Demo",
    accountType: "savings" as const,
    last4: "7034",
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
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
