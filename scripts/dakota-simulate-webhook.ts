/**
 * Local Dakota webhook simulator.
 *
 * Signs a fixture payload with a dev Ed25519 key exactly the way Dakota does
 * (sign over `timestamp + rawBody`, no separator) and POSTs it to the local
 * webhook route — so the entire pipeline (verify → inbox → handlers → ledger)
 * can be exercised with zero Dakota credentials.
 *
 * Usage:
 *   npx tsx scripts/dakota-simulate-webhook.ts --list
 *   npx tsx scripts/dakota-simulate-webhook.ts --fixture deposit-completed
 *   npx tsx scripts/dakota-simulate-webhook.ts --file path/to/envelope.json \
 *       --url http://localhost:3001/api/webhooks/dakota
 *
 * First run generates scripts/dev-webhook-key.pem (+ .pub.pem) and prints the
 * DAKOTA_WEBHOOK_PUBLIC_KEY override to put in .env.local — the app's
 * verifier honors that env var over the real Dakota keys. (*.pem is
 * gitignored.)
 *
 * By default the envelope/header event id is replaced with a fresh unique id
 * so repeated runs aren't deduplicated by the inbox; pass --keep-id to test
 * dedup/replay behavior.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  randomUUID,
  sign,
} from "node:crypto";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptsDir, "..");
const fixturesDir = join(repoRoot, "fixtures", "dakota");
const keyPath = join(scriptsDir, "dev-webhook-key.pem");
const pubKeyPath = join(scriptsDir, "dev-webhook-key.pub.pem");

function loadOrCreateKey() {
  if (!existsSync(keyPath)) {
    const { privateKey, publicKey } = generateKeyPairSync("ed25519");
    writeFileSync(keyPath, privateKey.export({ type: "pkcs8", format: "pem" }), {
      mode: 0o600,
    });
    writeFileSync(pubKeyPath, publicKey.export({ type: "spki", format: "pem" }));
    console.log(`Generated dev webhook keypair at ${keyPath}`);
  }
  const privateKey = createPrivateKey(readFileSync(keyPath));
  // Raw 32-byte Ed25519 public key = last 32 bytes of the SPKI DER.
  const pubDer = createPublicKey(privateKey).export({
    type: "spki",
    format: "der",
  });
  const rawPubHex = Buffer.from(pubDer).subarray(-32).toString("hex");
  return { privateKey, rawPubHex };
}

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      args[key] = next;
      i++;
    } else {
      args[key] = true;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.list || (!args.fixture && !args.file)) {
    mkdirSync(fixturesDir, { recursive: true });
    const fixtures = readdirSync(fixturesDir).filter((f) => f.endsWith(".json"));
    console.log("Available fixtures (fixtures/dakota/):");
    for (const f of fixtures) console.log(`  - ${f.replace(/\.json$/, "")}`);
    console.log("\nRun: npx tsx scripts/dakota-simulate-webhook.ts --fixture <name>");
    return;
  }

  const filePath = args.file
    ? resolve(String(args.file))
    : join(fixturesDir, `${args.fixture}.json`);
  if (!existsSync(filePath)) {
    console.error(`Fixture not found: ${filePath}`);
    process.exit(1);
  }

  const envelope = JSON.parse(readFileSync(filePath, "utf8"));
  if (!args["keep-id"]) {
    envelope.id = `evt_local_${randomUUID()}`;
  }
  envelope.created = Math.floor(Date.now() / 1000);

  const rawBody = JSON.stringify(envelope);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const { privateKey, rawPubHex } = loadOrCreateKey();

  // Ed25519 over `timestamp + body` — matches Dakota's scheme exactly.
  const signature = sign(null, Buffer.from(timestamp + rawBody, "utf8"), privateKey);

  const url = String(args.url ?? "http://localhost:3001/api/webhooks/dakota");
  console.log(`→ POST ${url}`);
  console.log(`  event: ${envelope.type} (${envelope.id})`);
  console.log(
    `  verifier override needed in .env.local:\n  DAKOTA_WEBHOOK_PUBLIC_KEY=${rawPubHex}\n`
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-signature": signature.toString("base64"),
      "x-webhook-timestamp": timestamp,
      "x-dakota-event-id": envelope.id,
      "x-dakota-event-type": envelope.type,
    },
    body: rawBody,
  });

  const body = await response.text();
  console.log(`← HTTP ${response.status}: ${body}`);
  if (response.status === 401) {
    console.log(
      "\n401 usually means DAKOTA_WEBHOOK_PUBLIC_KEY in .env.local doesn't match the dev key above (restart the dev server after changing it)."
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
