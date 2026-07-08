import { and, eq } from "drizzle-orm";
import { v5 as uuidv5 } from "uuid";
import { db } from "@/lib/db";
import { dakotaCustomers, dakotaRails, users, wallets } from "@/lib/db/schema";
import { createWallet } from "./wallets";
import { createDestination, createRecipient } from "./recipients";
import { createAccount } from "./accounts";
import { defaultNetworkId } from "./networks";

/**
 * Post-KYC provisioning: everything a newly-verified user needs before money
 * can move (DAKOTA-PLAN.md §5b):
 *
 *   1. Dakota wallet (platform signer group + default policy attached)
 *   2. "self" recipient
 *   3. crypto destination on that recipient → the user's own wallet address
 *   4. onramp account (USD→USDC) → virtual bank details for the deposit page
 *
 * Idempotent at two layers: each step is skipped when its output is already
 * recorded locally, and every Dakota POST uses a deterministic idempotency
 * key derived from (user, step) — so a crashed run that already reached
 * Dakota replays the cached response instead of creating a duplicate.
 *
 * Callers: the customer.kyb_status webhook handler (throw → Dakota retries)
 * and POST /api/customers/provision (manual retry from the onboarding page).
 */

// Fixed namespace for uuidv5 — never change this, or retried steps will stop
// matching their original Dakota idempotency keys.
const MONETA_IDEMPOTENCY_NAMESPACE = "8f3a9b21-64c7-45de-9d02-7c1e5a80b4f6";

export function provisioningIdempotencyKey(userId: string, step: string): string {
  return uuidv5(`${userId}:${step}`, MONETA_IDEMPOTENCY_NAMESPACE);
}

function requiredEnv(name: "DAKOTA_SIGNER_GROUP_ID" | "DAKOTA_POLICY_ID"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not configured — run scripts/dakota-bootstrap.ts and add its output to the environment`
    );
  }
  return value;
}

export interface ProvisioningResult {
  walletAddress: string;
  selfRecipientId: string;
  selfDestinationId: string;
  onrampAccountId: string;
}

export async function provisionCustomer(userId: string): Promise<ProvisioningResult> {
  const [row] = await db
    .select({
      customer: dakotaCustomers,
      fullName: users.fullName,
    })
    .from(dakotaCustomers)
    .innerJoin(users, eq(users.id, dakotaCustomers.userId))
    .where(eq(dakotaCustomers.userId, userId))
    .limit(1);

  if (!row) {
    throw new Error(`provisioning: no Dakota customer record for user ${userId}`);
  }
  const { customer, fullName } = row;
  if (customer.kycStatus !== "active") {
    throw new Error(
      `provisioning: customer ${customer.dakotaCustomerId} is ${customer.kycStatus}, not active`
    );
  }

  const signerGroupId = requiredEnv("DAKOTA_SIGNER_GROUP_ID");
  const policyId = requiredEnv("DAKOTA_POLICY_ID");
  const networkId = defaultNetworkId();

  // Step 1: wallet
  let [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet) {
    const dakotaWallet = await createWallet(
      {
        customerId: customer.dakotaCustomerId,
        name: `${fullName} — Moneta`,
        family: "evm",
        signerGroups: [signerGroupId],
        policies: [policyId],
      },
      { idempotencyKey: provisioningIdempotencyKey(userId, "wallet") }
    );

    [wallet] = await db
      .insert(wallets)
      .values({
        userId,
        dakotaWalletId: dakotaWallet.id,
        family: dakotaWallet.family,
        address: dakotaWallet.address,
        name: dakotaWallet.name,
      })
      .onConflictDoNothing({ target: wallets.dakotaWalletId })
      .returning();

    if (!wallet) {
      [wallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.dakotaWalletId, dakotaWallet.id))
        .limit(1);
    }
  }

  // Step 2: "self" recipient (crypto-only, so no postal address required)
  let selfRecipientId = customer.selfRecipientId;
  if (!selfRecipientId) {
    const recipient = await createRecipient(
      {
        customerId: customer.dakotaCustomerId,
        name: fullName,
        externalId: `self:${userId}`,
      },
      { idempotencyKey: provisioningIdempotencyKey(userId, "self-recipient") }
    );
    selfRecipientId = recipient.id;
    await db
      .update(dakotaCustomers)
      .set({ selfRecipientId, updatedAt: new Date() })
      .where(eq(dakotaCustomers.userId, userId));
  }

  // Step 3: crypto destination → the user's own wallet address
  let selfDestinationId = customer.selfDestinationId;
  if (!selfDestinationId) {
    const destination = await createDestination(
      {
        recipientId: selfRecipientId,
        destinationType: "crypto",
        name: "Moneta wallet",
        cryptoAddress: wallet.address,
        networkId,
        assets: ["USDC"],
      },
      { idempotencyKey: provisioningIdempotencyKey(userId, "self-destination") }
    );
    selfDestinationId = destination.id;
    await db
      .update(dakotaCustomers)
      .set({ selfDestinationId, updatedAt: new Date() })
      .where(eq(dakotaCustomers.userId, userId));
  }

  // Step 4: onramp account → virtual ACH/wire details for the deposit page
  let [onramp] = await db
    .select()
    .from(dakotaRails)
    .where(and(eq(dakotaRails.userId, userId), eq(dakotaRails.accountType, "onramp")))
    .limit(1);

  if (!onramp) {
    const account = await createAccount(
      {
        accountType: "onramp",
        customerId: customer.dakotaCustomerId,
        cryptoDestinationId: selfDestinationId,
        sourceAsset: "USD",
        destinationAsset: "USDC",
        destinationNetworkId: networkId,
        capabilities: ["ach", "fedwire"],
        rail: "ach",
      },
      { idempotencyKey: provisioningIdempotencyKey(userId, "onramp") }
    );

    [onramp] = await db
      .insert(dakotaRails)
      .values({
        userId,
        dakotaAccountId: account.id,
        accountType: "onramp",
        sourceAsset: "USD",
        destinationAsset: "USDC",
        rail: account.rail ?? "ach",
        bankAccountInfo: account.bank_account,
      })
      .onConflictDoNothing({ target: dakotaRails.dakotaAccountId })
      .returning();

    if (!onramp) {
      [onramp] = await db
        .select()
        .from(dakotaRails)
        .where(eq(dakotaRails.dakotaAccountId, account.id))
        .limit(1);
    }
  }

  return {
    walletAddress: wallet.address,
    selfRecipientId,
    selfDestinationId,
    onrampAccountId: onramp.dakotaAccountId,
  };
}
