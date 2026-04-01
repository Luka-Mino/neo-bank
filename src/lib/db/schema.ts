import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  jsonb,
  boolean,
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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
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
    applicationId: text("application_id"),
    applicationUrl: text("application_url"),
    applicationExpiresAt: timestamp("application_expires_at", { withTimezone: true }),
    externalId: text("external_id"),
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

export const dakotaAccounts = pgTable(
  "dakota_accounts",
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
  (table) => [index("idx_dakota_accounts_user").on(table.userId)]
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_transactions_user").on(table.userId),
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
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_webhook_events_type").on(table.eventType),
  ]
);

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
