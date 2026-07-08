/**
 * One-time Dakota environment bootstrap (idempotent — safe to re-run).
 *
 *   npx tsx scripts/dakota-bootstrap.ts [--url https://your-app.com]
 *
 * Requires DAKOTA_API_KEY (+ DAKOTA_ENV) in .env.local. Performs, in order:
 *   0. Platform signer keypair — if DAKOTA_SIGNER_PRIVATE_KEY is missing,
 *      generates a P-256 keypair, prints the env line, and exits so the key
 *      is saved before anything is registered against it.
 *   1. Registers the signer (ES256) and the "moneta-ops" signer group —
 *      skipped if the group already exists.
 *   2. Creates the "moneta-default" policy (approval_threshold 1, allow) —
 *      skipped if it already exists.
 *   3. Registers a global webhook target for <url>/api/webhooks/dakota —
 *      skipped if one exists for that URL; skipped with a warning for
 *      localhost URLs (Dakota only delivers to public HTTPS).
 *
 * Prints the DAKOTA_SIGNER_GROUP_ID / DAKOTA_POLICY_ID env lines to add.
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

import { createPrivateKey, createPublicKey, generateKeyPairSync } from "node:crypto";
import { dakota } from "../src/lib/dakota/client";

const SIGNER_NAME = "moneta-platform";
const GROUP_NAME = "moneta-ops";
const POLICY_NAME = "moneta-default";

interface SignerGroup {
  id: string;
  name: string;
  members?: Array<{ id: string; public_key: string }>;
}
interface Policy {
  id: string;
  name: string;
  rules?: unknown[];
}
interface WebhookTarget {
  id: string;
  url: string;
  global?: boolean;
}

function unwrapList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  const data = (res as { data?: T[] })?.data;
  return Array.isArray(data) ? data : [];
}

function publicKeyB64FromPrivateEnv(encoded: string): string {
  const pem = Buffer.from(encoded, "base64").toString("utf8");
  const publicDer = createPublicKey(createPrivateKey(pem)).export({
    type: "spki",
    format: "der",
  });
  return Buffer.from(publicDer).toString("base64");
}

async function main() {
  if (!process.env.DAKOTA_API_KEY || process.env.DAKOTA_API_KEY.length < 40) {
    console.error(
      "DAKOTA_API_KEY missing or not a real key (Dakota keys are 60 chars).\n" +
        `Create one in the dashboard (${
          process.env.DAKOTA_ENV === "production"
            ? "https://platform.dakota.xyz"
            : "https://platform.sandbox.dakota.xyz"
        }) and add it to .env.local first.`
    );
    process.exit(1);
  }

  // Step 0: platform signer keypair
  let signerKeyEnv = process.env.DAKOTA_SIGNER_PRIVATE_KEY;
  if (!signerKeyEnv) {
    const { privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
    const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
    signerKeyEnv = Buffer.from(pem).toString("base64");
    console.log("Generated platform signer keypair. Add this to .env.local (and your secrets manager for production):\n");
    console.log(`DAKOTA_SIGNER_PRIVATE_KEY=${signerKeyEnv}\n`);
    console.log("Then re-run this script to register it with Dakota.");
    process.exit(0);
  }
  const publicKeyB64 = publicKeyB64FromPrivateEnv(signerKeyEnv);

  // Step 1: signer + signer group
  const groups = unwrapList<SignerGroup>(await dakota.get("/signer-groups"));
  let group = groups.find((g) => g.name === GROUP_NAME);
  if (group) {
    console.log(`✓ signer group "${GROUP_NAME}" exists (${group.id})`);
  } else {
    await dakota.post("/signers", {
      name: SIGNER_NAME,
      public_key: publicKeyB64,
      key_type: "ES256",
    });
    console.log(`✓ registered signer "${SIGNER_NAME}"`);
    group = await dakota.post<SignerGroup>("/signer-groups", {
      name: GROUP_NAME,
      member_keys: [publicKeyB64],
    });
    console.log(`✓ created signer group "${GROUP_NAME}" (${group.id})`);
  }

  // Step 2: default policy (rules included at creation need no endorsement)
  const policies = unwrapList<Policy>(await dakota.get("/policies"));
  let policy = policies.find((p) => p.name === POLICY_NAME);
  if (policy) {
    console.log(`✓ policy "${POLICY_NAME}" exists (${policy.id})`);
  } else {
    policy = await dakota.post<Policy>("/policies", {
      name: POLICY_NAME,
      description: "Moneta default: single platform signature authorizes a send",
      signer_group_id: group.id,
      rules: [
        {
          rule_type: "approval_threshold",
          action: "allow",
          definition: { threshold: 1 },
        },
      ],
    });
    console.log(`✓ created policy "${POLICY_NAME}" (${policy.id})`);
  }

  // Step 3: webhook target
  const urlArgIndex = process.argv.indexOf("--url");
  const baseUrl =
    urlArgIndex > -1
      ? process.argv[urlArgIndex + 1]
      : process.env.NEXT_PUBLIC_APP_URL;
  const webhookUrl = baseUrl ? `${baseUrl.replace(/\/$/, "")}/api/webhooks/dakota` : null;

  if (!webhookUrl || /localhost|127\.0\.0\.1/.test(webhookUrl)) {
    console.log(
      `⚠ skipping webhook target (url: ${webhookUrl ?? "none"}) — Dakota only delivers to public HTTPS endpoints.\n` +
        "  Re-run with --url https://<public-tunnel-or-domain> once you have one,\n" +
        "  or test locally with: npm run dakota:webhook -- --fixture <name>"
    );
  } else {
    const targets = unwrapList<WebhookTarget>(await dakota.get("/webhooks/targets"));
    const existing = targets.find((t) => t.url === webhookUrl);
    if (existing) {
      console.log(`✓ webhook target exists (${existing.id}) → ${webhookUrl}`);
    } else {
      const target = await dakota.post<WebhookTarget>("/webhooks/targets", {
        url: webhookUrl,
        global: true,
      });
      console.log(`✓ created global webhook target (${target.id}) → ${webhookUrl}`);
    }
  }

  console.log("\nAdd these to .env.local:\n");
  console.log(`DAKOTA_SIGNER_GROUP_ID=${group.id}`);
  console.log(`DAKOTA_POLICY_ID=${policy.id}`);
  console.log(`DAKOTA_NETWORK_ID=${process.env.DAKOTA_NETWORK_ID ?? "base-sepolia"}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
