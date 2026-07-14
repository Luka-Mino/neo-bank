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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

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
    dakotaWalletId: text("dakota_wallet_id").notNull().unique(),
    family: text("family").notNull(),
    address: text("address").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_wallets_user").on(table.userId)]
);

export const walletBalances = pgTable(
  "wallet_balances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    walletId: uuid("wallet_id")
      .notNull()
      .references(() => wallets.id, { onDelete: "cascade" }),
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
    accountType: text("account_type").notNull(), // 'checking' | 'savings' | future
    nickname: text("nickname"),
    accountNumber: text("account_number").notNull().unique(),
    currency: text("currency").notNull().default("USD"),
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
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_cards_user").on(table.userId),
    index("idx_cards_account").on(table.accountId),
  ]
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
