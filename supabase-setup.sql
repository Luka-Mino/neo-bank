CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  email text NOT NULL,
  email_verified_at timestamp with time zone,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  phone text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT users_email_unique UNIQUE(email)
);

CREATE TABLE dakota_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  dakota_customer_id text NOT NULL,
  customer_type text DEFAULT 'individual' NOT NULL,
  kyc_status text DEFAULT 'pending' NOT NULL,
  application_id text,
  application_url text,
  application_expires_at timestamp with time zone,
  external_id text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT dakota_customers_user_id_unique UNIQUE(user_id),
  CONSTRAINT dakota_customers_dakota_customer_id_unique UNIQUE(dakota_customer_id)
);

CREATE TABLE wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  dakota_wallet_id text NOT NULL,
  family text NOT NULL,
  address text NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT wallets_dakota_wallet_id_unique UNIQUE(dakota_wallet_id)
);

CREATE TABLE wallet_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  wallet_id uuid NOT NULL,
  network_id text NOT NULL,
  asset text NOT NULL,
  balance numeric(30, 18) DEFAULT 0 NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE dakota_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  dakota_account_id text NOT NULL,
  account_type text NOT NULL,
  source_asset text,
  destination_asset text,
  rail text,
  bank_account_info jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT dakota_accounts_dakota_account_id_unique UNIQUE(dakota_account_id)
);

CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  dakota_tx_id text NOT NULL,
  tx_type text NOT NULL,
  status text NOT NULL,
  source_asset text,
  destination_asset text,
  source_amount numeric(30, 18),
  destination_amount numeric(30, 18),
  source_network text,
  destination_network text,
  recipient_id text,
  destination_id text,
  transaction_hash text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT transactions_dakota_tx_id_unique UNIQUE(dakota_tx_id)
);

CREATE TABLE recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  dakota_recipient_id text NOT NULL,
  name text NOT NULL,
  status text DEFAULT 'active' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT recipients_dakota_recipient_id_unique UNIQUE(dakota_recipient_id)
);

CREATE TABLE destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  recipient_id uuid NOT NULL,
  dakota_destination_id text NOT NULL,
  destination_type text NOT NULL,
  label text,
  details jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT destinations_dakota_destination_id_unique UNIQUE(dakota_destination_id)
);

CREATE TABLE webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  dakota_event_id text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamp with time zone,
  processing_error text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT webhook_events_dakota_event_id_unique UNIQUE(dakota_event_id)
);

CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  token text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT password_reset_tokens_token_unique UNIQUE(token)
);

CREATE TABLE email_verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  token text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT email_verification_tokens_token_unique UNIQUE(token)
);

CREATE TABLE transaction_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  transaction_id uuid NOT NULL,
  old_status text,
  new_status text NOT NULL,
  reason text,
  actor text DEFAULT 'system' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  actor_id text,
  actor_type text DEFAULT 'system' NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  metadata jsonb,
  ip_address text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  action_url text,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
