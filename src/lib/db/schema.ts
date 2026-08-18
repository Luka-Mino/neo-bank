import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  jsonb,
  boolean,
  smallint,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  // TOTP 2FA. Secret is AES-256-GCM encrypted with a key derived from
  // AUTH_SECRET (see src/lib/auth/totp.ts). Enabled only once the user has
  // proven a valid code (totp_enabled_at set).
  totpSecret: text("totp_secret"),
  totpEnabledAt: timestamp("totp_enabled_at", { withTimezone: true }),
  // Bumped to invalidate all existing JWTs (sign-out-everywhere, password
  // change, 2FA disable). A session whose token carries an older version is
  // rejected at the jwt callback — this is how stateless JWTs get revoked.
  tokenVersion: integer("token_version").notNull().default(0),
  // Optional email-code 2FA (alternative to TOTP for users without an
  // authenticator app). When on, login requires a code emailed at sign-in.
  emailOtpEnabled: boolean("email_otp_enabled").notNull().default(false),
  // The caller's current active org — set ONLY server-side by the org-switch
  // endpoint after a membership check, never from a request body. The jwt
  // callback reads this to mint the org claim. See ORG-FOUNDATION-SPEC.md.
  // FK to organizations(id) is declared in SQL (migration), not here, to avoid
  // a circular type reference (organizations already references users).
  activeOrgId: uuid("active_org_id"),
  // Set when the user requests deletion. PII is scrubbed and login disabled,
  // but transaction/audit records are RETAINED — AML/BSA require multi-year
  // retention, so "delete" is anonymize-and-close, not a hard row delete.
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Multi-tenancy: Organizations, Membership, Invitations, Approvals ────────
// The tenant boundary. Every user-owned business row (accounts, transactions,
// cards, recipients, wallets, dakota_customers, rails, recurring transfers) is
// scoped to an organization. A user is a MEMBER of one or more orgs via
// org_members (which carries their role). Existing single users get an
// auto-created "personal" org (migration 0016) so nothing breaks.
//
// SECURITY: org context is always resolved server-side from session + a
// verified org_members row — it is NEVER trusted from client input. This is
// the tenant-isolation boundary; a query missing its org_id filter is a
// cross-tenant leak.

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug"), // nullable; public handle for business orgs
    // 'personal' = the auto-created backward-compat org for a single user;
    // 'business' = a real institutional tenant (KYB entity).
    type: text("type").notNull().default("personal"),
    status: text("status").notNull().default("active"), // 'active' | 'suspended' | 'closed'
    // Founding user; NULL = system. Orgs are never hard-deleted (status='closed').
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "restrict" }),
    // Set ONLY on auto-created personal orgs — the idempotency key + 1:1 backfill
    // link that guarantees exactly one personal org per user.
    personalForUserId: uuid("personal_for_user_id")
      .unique()
      .references(() => users.id, { onDelete: "restrict" }),
    settings: jsonb("settings"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_orgs_slug").on(table.slug).where(sql`${table.slug} IS NOT NULL`),
  ]
);

// Membership + role. One row per (org, user). Role gates what a member may do.
export const orgMembers = pgTable(
  "org_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"), // 'owner'|'admin'|'member'|'viewer' (ranked 3/2/1/0)
    // Orthogonal maker/checker capability (NOT a rank): a member can be an approver;
    // an admin who *makes* a payment still can't self-approve. Owners approve implicitly.
    canApprove: boolean("can_approve").notNull().default(false),
    status: text("status").notNull().default("active"), // 'invited'|'active'|'suspended'|'removed'
    invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Exactly one membership per user per org — prevents duplicate/ambiguous roles.
    uniqueIndex("idx_org_members_unique").on(table.orgId, table.userId),
    index("idx_org_members_user").on(table.userId),
    index("idx_org_members_org").on(table.orgId),
  ]
);

// Invite-by-email. The raw token is emailed once and only its hash is stored
// (same pattern as magic links / backup codes). Single-use, expiring.
export const orgInvitations = pgTable(
  "org_invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(), // invitee's email (lowercased)
    role: text("role").notNull().default("member"),
    canApprove: boolean("can_approve").notNull().default(false),
    tokenHash: text("token_hash").notNull().unique(),
    invitedBy: uuid("invited_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"), // 'pending' | 'accepted' | 'revoked'
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    acceptedByUserId: uuid("accepted_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_org_invitations_org").on(table.orgId),
    index("idx_org_invitations_email").on(table.email),
  ]
);

// Currency/asset registry — model only, no FX logic in Phase 0. accounts.asset,
// approval_policies.threshold_asset and approval_requests.asset reference it.
export const assets = pgTable("assets", {
  code: text("code").primaryKey(), // 'USD' | 'USDC' | 'EUR' | 'EURC' | 'GBP'
  name: text("name").notNull(),
  kind: text("kind").notNull(), // 'fiat' | 'stablecoin'
  decimals: smallint("decimals").notNull().default(2),
  defaultNetworkId: text("default_network_id"),
  enabled: boolean("enabled").notNull().default(true),
});

// Maker/checker policy: "action over $X needs N approvals". Ships disabled
// (enabled=false) — inert scaffold until an org opts in. Threshold is
// asset-normalized so it can't be evaded by denominating in another currency.
export const approvalPolicies = pgTable(
  "approval_policies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    actionType: text("action_type").notNull(), // 'transfer.external' | 'transfer.internal' | 'card.issue' | ...
    thresholdAmount: numeric("threshold_amount", { precision: 30, scale: 18 }), // null = always require
    thresholdAsset: text("threshold_asset")
      .notNull()
      .default("USD")
      .references(() => assets.code),
    requiredApprovals: smallint("required_approvals").notNull().default(1),
    enabled: boolean("enabled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_approval_policies_unique").on(
      table.orgId,
      table.actionType,
      table.thresholdAsset
    ),
  ]
);

// A pending maker/checker action instance. payload_hash is an HMAC of the
// canonical payload, re-verified at execute (TOCTOU guard); executed_tx_id makes
// execution idempotent (set once → never re-run).
export const approvalRequests = pgTable(
  "approval_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    actionType: text("action_type").notNull(),
    payload: jsonb("payload").notNull(),
    payloadHash: text("payload_hash").notNull(),
    amount: numeric("amount", { precision: 30, scale: 18 }),
    asset: text("asset").references(() => assets.code),
    status: text("status").notNull().default("pending"), // pending|approved|rejected|executed|expired|cancelled
    requiredApprovals: smallint("required_approvals").notNull().default(1),
    approvalsCount: smallint("approvals_count").notNull().default(0),
    requestedBy: uuid("requested_by") // the maker
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    executedTxId: uuid("executed_tx_id").references(() => transactions.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    executedAt: timestamp("executed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_approval_requests_org").on(table.orgId, table.status)]
);

// One row per approver vote (race-safe N-of-M). Maker≠checker enforced in code
// AND DB (approver_id != requested_by); UNIQUE prevents padding the count.
export const approvalDecisions = pgTable(
  "approval_decisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => approvalRequests.id, { onDelete: "cascade" }),
    approverId: uuid("approver_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    decision: text("decision").notNull(), // 'approve' | 'reject'
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_approval_decisions_unique").on(
      table.requestId,
      table.approverId
    ),
  ]
);

// Recognized login devices, for "new sign-in" security alerts. We store a
// salted hash of (user-agent + IP prefix) — never the raw IP — so we can
// tell "seen before" from "new device/location" without keeping PII.
export const loginDevices = pgTable(
  "login_devices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fingerprint: text("fingerprint").notNull(), // sha256(userId + UA + ip/16)
    userAgent: text("user_agent"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_login_devices_user_fp").on(table.userId, table.fingerprint),
  ]
);

// Per-user notification settings. Row created lazily on first read.
export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  emailTransactions: boolean("email_transactions").notNull().default(true),
  emailSecurity: boolean("email_security").notNull().default(true),
  emailProduct: boolean("email_product").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dakotaCustomers = pgTable(
  "dakota_customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    // Nullable during the expand→backfill→enforce migration (0016→0018); set
    // NOT NULL in 0018 once every query sets the RLS GUC. See ORG-FOUNDATION-SPEC.md.
    orgId: uuid("org_id").references(() => organizations.id, { onDelete: "restrict" }),
    dakotaCustomerId: text("dakota_customer_id").notNull().unique(),
    customerType: text("customer_type").notNull().default("individual"),
    kycStatus: text("kyc_status").notNull().default("pending"),
    // Latest reason_code from customer.kyb_status.* webhooks — e.g.
    // "pending_proof_of_address" when the $3k/7-day inbound ceiling holds
    // deposits until a PoA document is approved. Cleared when resolved.
    kycReasonCode: text("kyc_reason_code"),
    applicationId: text("application_id"),
    applicationUrl: text("application_url"),
    applicationExpiresAt: timestamp("application_expires_at", { withTimezone: true }),
    externalId: text("external_id"),
    // Post-KYC provisioning state (see src/lib/dakota/provisioning.ts): the
    // user's "self" recipient and its crypto destination pointing at their
    // own wallet — the target for onramp deposits.
    selfRecipientId: text("self_recipient_id"),
    selfDestinationId: text("self_destination_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_dakota_customers_user").on(table.userId),
    index("idx_dakota_customers_org").on(table.orgId),
    index("idx_dakota_customers_dak_id").on(table.dakotaCustomerId),
  ]
);

export const wallets = pgTable(
  "wallets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Nullable during the expand→backfill→enforce migration (0016→0018); set
    // NOT NULL in 0018 once every query sets the RLS GUC. See ORG-FOUNDATION-SPEC.md.
    orgId: uuid("org_id").references(() => organizations.id, { onDelete: "restrict" }),
    dakotaWalletId: text("dakota_wallet_id").notNull().unique(),
    family: text("family").notNull(),
    address: text("address").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_wallets_user").on(table.userId),
    index("idx_wallets_org").on(table.orgId),
  ]
);

export const walletBalances = pgTable(
  "wallet_balances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    walletId: uuid("wallet_id")
      .notNull()
      .references(() => wallets.id, { onDelete: "cascade" }),
    // Denormalized org for RLS; composite FK (org_id,wallet_id)→wallets(org_id,id) in 0018.
    orgId: uuid("org_id").references(() => organizations.id, { onDelete: "restrict" }),
    networkId: text("network_id").notNull(),
    asset: text("asset").notNull(),
    balance: numeric("balance", { precision: 30, scale: 18 }).notNull().default("0"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_wallet_balances_unique").on(
      table.walletId,
      table.networkId,
      table.asset
    ),
  ]
);

// Renamed from dakota_accounts → dakota_rails. This table holds Dakota
// on-ramp / off-ramp rail configuration (ACH/wire endpoint metadata) and
// is unrelated to the user-facing `accounts` table below.
export const dakotaRails = pgTable(
  "dakota_rails",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Nullable during the expand→backfill→enforce migration (0016→0018); set
    // NOT NULL in 0018 once every query sets the RLS GUC. See ORG-FOUNDATION-SPEC.md.
    orgId: uuid("org_id").references(() => organizations.id, { onDelete: "restrict" }),
    dakotaAccountId: text("dakota_account_id").notNull().unique(),
    accountType: text("account_type").notNull(),
    sourceAsset: text("source_asset"),
    destinationAsset: text("destination_asset"),
    rail: text("rail"),
    bankAccountInfo: jsonb("bank_account_info"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_dakota_rails_user").on(table.userId)]
);

// User-facing banking accounts. A user can have many — checking, savings,
// goal-based buckets, etc. account_type is free-text so adding new types
// later (joint, business, sub-account) is a code-only change.
export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Nullable during the expand→backfill→enforce migration (0016→0018); set
    // NOT NULL in 0018 once every query sets the RLS GUC. See ORG-FOUNDATION-SPEC.md.
    orgId: uuid("org_id").references(() => organizations.id, { onDelete: "restrict" }),
    accountType: text("account_type").notNull(), // 'checking' | 'savings' | future
    nickname: text("nickname"),
    accountNumber: text("account_number").notNull().unique(),
    currency: text("currency").notNull().default("USD"),
    // The asset this account holds (multi-currency). References the assets
    // registry (FK added in 0018). Deposits must credit a matching-asset account.
    asset: text("asset").notNull().default("USDC").references(() => assets.code),
    balance: numeric("balance", { precision: 30, scale: 18 }).notNull().default("0"),
    status: text("status").notNull().default("active"), // 'active' | 'frozen' | 'closed'
    isPrimary: boolean("is_primary").notNull().default(false),
    // Savings goal — display-only target for progress UI; null = no goal.
    goalAmount: numeric("goal_amount", { precision: 30, scale: 18 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_accounts_user").on(table.userId),
    // Exactly one primary account per user (open accounts only). Allows a
    // closed account to retain is_primary=false without conflict.
    uniqueIndex("idx_accounts_one_primary_per_user")
      .on(table.userId)
      .where(sql`${table.isPrimary} = true AND ${table.status} <> 'closed'`),
  ]
);

// Cards belong to ONE account at a time. RESTRICT on account delete
// forces the operator to detach or close cards explicitly.
export const cards = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Nullable during the expand→backfill→enforce migration (0016→0018); set
    // NOT NULL in 0018 once every query sets the RLS GUC. See ORG-FOUNDATION-SPEC.md.
    orgId: uuid("org_id").references(() => organizations.id, { onDelete: "restrict" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    cardType: text("card_type").notNull(), // 'debit' | 'credit' | 'virtual' | 'physical'
    last4: text("last4").notNull(),
    status: text("status").notNull().default("active"), // 'active' | 'frozen' | 'replaced' | 'canceled'
    nickname: text("nickname"),
    expMonth: smallint("exp_month"),
    expYear: smallint("exp_year"),
    network: text("network"), // 'visa' | 'mastercard'
    panToken: text("pan_token"), // placeholder for issuer PAN reference
    // Issuer's own card id (e.g. Stripe `ic_...`). Null for mock-issued cards.
    // The auth webhook maps an incoming authorization back to our card by this.
    externalCardId: text("external_card_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_cards_user").on(table.userId),
    index("idx_cards_account").on(table.accountId),
    index("idx_cards_external_id").on(table.externalCardId),
  ]
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Nullable during the expand→backfill→enforce migration (0016→0018); set
    // NOT NULL in 0018 once every query sets the RLS GUC. See ORG-FOUNDATION-SPEC.md.
    orgId: uuid("org_id").references(() => organizations.id, { onDelete: "restrict" }),
    // Which of the user's accounts this transaction debited/credited.
    // Nullable during the backfill window; application requires it for new rows.
    accountId: uuid("account_id").references(() => accounts.id, {
      onDelete: "restrict",
    }),
    dakotaTxId: text("dakota_tx_id").notNull().unique(),
    txType: text("tx_type").notNull(),
    status: text("status").notNull(),
    sourceAsset: text("source_asset"),
    destinationAsset: text("destination_asset"),
    sourceAmount: numeric("source_amount", { precision: 30, scale: 18 }),
    destinationAmount: numeric("destination_amount", { precision: 30, scale: 18 }),
    sourceNetwork: text("source_network"),
    destinationNetwork: text("destination_network"),
    recipientId: text("recipient_id"),
    destinationId: text("destination_id"),
    transactionHash: text("transaction_hash"),
    // Spending category: auto-assigned by the merchant mapper, user can
    // override (manual overrides win — see /api/transactions/[id] PATCH).
    category: text("category"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_transactions_user").on(table.userId),
    index("idx_transactions_account").on(table.accountId),
    index("idx_transactions_status").on(table.status),
    index("idx_transactions_created").on(table.createdAt),
    index("idx_transactions_dakota_id").on(table.dakotaTxId),
  ]
);

export const recipients = pgTable(
  "recipients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Nullable during the expand→backfill→enforce migration (0016→0018); set
    // NOT NULL in 0018 once every query sets the RLS GUC. See ORG-FOUNDATION-SPEC.md.
    orgId: uuid("org_id").references(() => organizations.id, { onDelete: "restrict" }),
    dakotaRecipientId: text("dakota_recipient_id").notNull().unique(),
    name: text("name").notNull(),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_recipients_user").on(table.userId)]
);

export const destinations = pgTable(
  "destinations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => recipients.id, { onDelete: "cascade" }),
    // Denormalized org for RLS (per-row). A composite FK (org_id,recipient_id)→
    // recipients(org_id,id) added in 0018 makes it impossible to diverge from the parent.
    orgId: uuid("org_id").references(() => organizations.id, { onDelete: "restrict" }),
    dakotaDestinationId: text("dakota_destination_id").notNull().unique(),
    destinationType: text("destination_type").notNull(),
    label: text("label"),
    details: jsonb("details").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_destinations_recipient").on(table.recipientId)]
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dakotaEventId: text("dakota_event_id").notNull().unique(),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    processingError: text("processing_error"),
    // How many times processing has thrown. After MAX the row is dead-lettered
    // (deadLetteredAt set) so a poison event stops retrying and surfaces.
    attempts: integer("attempts").notNull().default(0),
    deadLetteredAt: timestamp("dead_lettered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_webhook_events_type").on(table.eventType),
  ]
);

// ─── Recurring Transfers ────────────────────────────────────────────────────
// Standing internal (book-entry) transfers. Executed by the recurring sweep
// (see /api/transfers/recurring/run) which advances next_run_at atomically —
// a rule fires at most once per period even if two sweeps race.

export const recurringTransfers = pgTable(
  "recurring_transfers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Nullable during the expand→backfill→enforce migration (0016→0018); set
    // NOT NULL in 0018 once every query sets the RLS GUC. See ORG-FOUNDATION-SPEC.md.
    orgId: uuid("org_id").references(() => organizations.id, { onDelete: "restrict" }),
    fromAccountId: uuid("from_account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    toAccountId: uuid("to_account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 30, scale: 18 }).notNull(),
    note: text("note"),
    frequency: text("frequency").notNull(), // 'weekly' | 'biweekly' | 'monthly'
    nextRunAt: timestamp("next_run_at", { withTimezone: true }).notNull(),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    status: text("status").notNull().default("active"), // 'active' | 'paused' | 'cancelled'
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_recurring_user").on(table.userId),
    index("idx_recurring_due").on(table.status, table.nextRunAt),
  ]
);

// ─── Dakota Sync State ──────────────────────────────────────────────────────
// Small KV for reconciliation cursors (e.g. the GET /events high-water mark).

export const dakotaSyncState = pgTable("dakota_sync_state", {
  key: text("key").primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Password Reset Tokens ──────────────────────────────────────────────────

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Email Verification Tokens ──────────────────────────────────────────────

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Email 2FA Codes ────────────────────────────────────────────────────────
// Short-lived login codes for users whose 2FA method is email. The code is
// stored as a bcrypt hash (never plaintext); single-use, 10-minute lifetime.

export const emailOtpCodes = pgTable(
  "email_otp_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    attempts: integer("attempts").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_email_otp_user").on(table.userId)]
);

// ─── Two-Factor Backup Codes ────────────────────────────────────────────────
// One-time recovery codes issued when a user enables TOTP 2FA, so losing an
// authenticator device doesn't mean permanent lockout. Codes are high-entropy
// and stored as a keyed HMAC (never plaintext); each is single-use (used_at).

export const twoFactorBackupCodes = pgTable(
  "two_factor_backup_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    codeHash: text("code_hash").notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_2fa_backup_user").on(table.userId)]
);

// ─── Magic-Link Login Tokens ────────────────────────────────────────────────
// Passwordless sign-in: a single-use, short-lived token emailed as a link.
// Consumed by the "magic-link" credentials provider in src/lib/auth/config.ts.

export const magicLinkTokens = pgTable("magic_link_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Transaction Status History ─────────────────────────────────────────────

export const transactionStatusHistory = pgTable(
  "transaction_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),
    // Denormalized org for RLS; composite FK (org_id,transaction_id)→transactions(org_id,id) in 0018.
    orgId: uuid("org_id").references(() => organizations.id, { onDelete: "restrict" }),
    oldStatus: text("old_status"),
    newStatus: text("new_status").notNull(),
    reason: text("reason"),
    actor: text("actor").notNull().default("system"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_tx_status_history").on(table.transactionId)]
);

// ─── Audit Log ──────────────────────────────────────────────────────────────

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Nullable — system actors have no org. Not RLS-enforced (per-tenant audit
    // filtering is app-level). Set for user-initiated actions.
    orgId: uuid("org_id").references(() => organizations.id, { onDelete: "set null" }),
    actorId: text("actor_id"),
    actorType: text("actor_type").notNull().default("system"),
    action: text("action").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id"),
    metadata: jsonb("metadata"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_audit_log_actor").on(table.actorId),
    index("idx_audit_log_resource").on(table.resourceType, table.resourceId),
    index("idx_audit_log_created").on(table.createdAt),
  ]
);

// ─── Notifications ──────────────────────────────────────────────────────────

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    actionUrl: text("action_url"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_notifications_user").on(table.userId),
    index("idx_notifications_unread").on(table.userId, table.readAt),
  ]
);
