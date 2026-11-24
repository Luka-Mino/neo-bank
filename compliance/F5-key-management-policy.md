> DRAFT – for counsel review. Not legal advice.
> Date: 2026-11-24 · Status: DRAFT – for counsel · Owner: [ENGINEERING LEAD] · Version 0.1

# F5: Key-management policy

**Entity:** [ENTITY NAME] ("Moneta"). **Approved by:** [QUALIFIED INDIVIDUAL] on [DATE]. **Revise** as soon as Dakota answers the custody questions (A1 Q2–Q3).

## 1. Why this matters

Today one private key on Moneta's server can move every customer's USDC. That key is the single largest security risk ([F2](F2-information-security-program.md) R1). It is also the main reason the research finds Moneta is likely a money transmitter in its own right ([report](<../reports/Moneta licensing and permits.md>)). Partner banks expect a key-management policy with dual control and separation of duties ([2024 Joint Statement](https://fdic.gov/joint-statement-third-party-deposit-products.pdf); [research notes Q4, item 10](<../research_notes/Moneta licensing and permits/federal_and_dakota_model.md>)).

This policy covers:
- **Design A:** the current design, where the platform holds the only signer (§4);
- **Design B:** a future design where the user's passkey must sign (§5);
- **Design C:** Dakota hosts the wallet (§6).

It also covers the app's other secrets (§3, §7).

## 2. Who does what

| Area | Dakota | Moneta |
|---|---|---|
| Wallet signing | Verifies signatures and enforces wallet policies. Its docs say it never has access to private keys; its Terms also describe a three-shard "Dakota-Supported Wallet" | Design A: holds the platform signer key. Design B: holds only public keys; users hold theirs |
| Signer-group governance | Requires changes to be signed by the group's governance, which by default is the group itself with a quorum of 1 ([Dakota signing guide](https://docs.dakota.xyz/documentation/signing-guide.md)) | Design A: the platform key is the whole quorum |
| API and webhook keys | Issues them | Stores and rotates them |
| Card data | Dakota and its card processor hold it | Holds no card keys |

## 3. Key and secret register

The steps to rotate each secret are in `DR-RUNBOOK.md` under "Secret rotation". That section was being added on 2026-11-24 and is not yet committed. Don't copy them here.

| Secret | Protects | If stolen | Who can read it |
|---|---|---|---|
| `DAKOTA_SIGNER_PRIVATE_KEY` | Every wallet send and every signer-group change | Attacker can move all customers' USDC and lock Moneta out | [ENGINEERING LEAD], [CEO] |
| `AUTH_SECRET` | Session signing, plus the keys derived from it (§7) | Forge a session for any user. With a database copy, decrypt 2FA secrets and phone numbers | [ENGINEERING LEAD], [CEO] |
| `DAKOTA_API_KEY` | Dakota API: customers, recipients, transfers | `[DAKOTA: what can this key do without a wallet signature?]` | [ENGINEERING LEAD] |
| `DATABASE_URL`, and `SYSTEM_DATABASE_URL` (a role that bypasses row-level security, being added in plan C1) | Full database access | All customer data | [ENGINEERING LEAD] |
| `DAKOTA_WEBHOOK_PUBLIC_KEY` | Checks that webhooks come from Dakota | Public, but a swapped value would let forged events in | [ENGINEERING LEAD] |
| `CRON_SECRET`, `RESEND_API_KEY` / `SMTP_URL`, Upstash token (planned) | Crons, email sending, rate limits | Phishing from our domain; limits switched off | [ENGINEERING LEAD] |
| `STRIPE_ISSUING_WEBHOOK_SECRET` | Alternative card provider, not in use | — | Remove if unused |
| Vendor console and GitHub logins | Everything above | Everything above | Named people only. Password manager plus MFA |

**Rules for every secret**
- Production values live only in Vercel's Production environment. Sandbox and preview use different values.
- Never put a secret in chat, a ticket, a commit or a log. gitleaks runs in CI.
- Read secrets only through `src/lib/secrets.ts`. Its `SECRET_NAMES` list is missing `SMTP_URL`, `STRIPE_ISSUING_WEBHOOK_SECRET` and the new database and Upstash values. Add them.
- Review who can read production environment variables every quarter. Remove access within 1 business day when someone leaves, then rotate what they could read.

## 4. Design A (today): the platform holds the only signer

**Facts from the code:**
- `npm run dakota:bootstrap` (`scripts/dakota-bootstrap.ts`) generates one ES256 (ECDSA P-256) keypair.
- It registers that key as the only signer in one signer group (`moneta-ops`).
- It creates the policy `moneta-default` with `approval_threshold` 1. Provisioning attaches that group and policy to every customer wallet (`src/lib/dakota/provisioning.ts`).
- The key is held base64-encoded in `DAKOTA_SIGNER_PRIVATE_KEY` and read only by `getPlatformSignerKey()` (`src/lib/dakota/signing.ts`).

**Generation**
1. Two people are present: [ENGINEERING LEAD] and [CEO]. Use an up-to-date trusted machine. Never generate in CI.
2. The bootstrap script **prints the private key to the terminal**. Turn off screen recording and terminal logging, and clear the scrollback afterwards. To do: change the script to write a file with owner-only permissions instead.
3. Record in the key register (§8): the date, the people present, and the public key's fingerprint. Never record the private key.

**Storage**
- **Live copy:** Vercel Production environment only.
- **Backup:** two encrypted offline copies (`DR-RUNBOOK.md` already requires one). Each is encrypted with a passphrase held by a different person, and the copies are kept in different places. [Specify where.]
- **Target:** a cloud key service (KMS/HSM) that signs without releasing the key. The `SecretsProvider` seam exists in `src/lib/secrets.ts`. Plan 4.2 waits on Dakota's custody answer, because the key may go away.

**Use**
- Only server code signs, and only after the API checks have passed: session, org scope, ownership, KYC `active`, verified email and 2FA.
- The key is never logged: the logger redacts `private` fields, and Sentry `sendDefaultPii` is false.
- Any signing outside the app, such as a governance change, needs two people and a written note in the key register.

**Rotation**
- Rotate on any suspected exposure, and when anyone who had access leaves. `[DECIDE: also yearly? DR-RUNBOOK says "only on exposure".]`
- Order matters:
  1. Register the new signer.
  2. Add it to the signer group, signed with the current key.
  3. Make a test send.
  4. Detach the old signer.
- Never detach a wallet's last signer group. That leaves the wallet unusable.

**Compromise:** a severity 1 incident ([F7](F7-incident-response-plan.md)).
1. Stop our own signing: delete `DAKOTA_SIGNER_PRIVATE_KEY` from Vercel and redeploy. `getPlatformSignerKey()` then fails, so the app can sign nothing.
2. Call Dakota immediately. With a quorum of 1, the attacker can sign sends **and** governance changes: they can add their own signer or remove ours. Ask Dakota to freeze the signer group and the wallets. `[DAKOTA: is there an emergency freeze, and how do we reach it out of hours?]`
3. Rotate if we still can, then review every send since the earliest possible exposure.

**Loss**
- Restore from the offline backup.
- Without a backup, a new signer cannot be added to existing groups, because that needs the old key's governance signature. Every wallet would be stranded unless Dakota can recover it. `[DAKOTA: recovery path for a lost governance key.]`
- This is why the backup is mandatory.

**Destruction:** only after wind-down ([F6](F6-wind-down-plan.md)), when Dakota confirms every wallet is empty or transferred. Destroy all copies and record it.

## 5. Design B (future): the user's passkey must sign

This is the redesign the research recommends (plan 1c.6(b)).
- **The user's key is required for every send.** It is either the only signer, or one half of a 2-of-2 where the platform key cannot act alone. A platform key that can sign alone must not exist.
- **The user's key is in the governance quorum,** so Moneta cannot add its own signer or remove the user.
- **Passkeys (WebAuthn)** are created on the user's device. Moneta stores only the public key and credential ID.
- **Recovery:** the user registers a second passkey. There is no path where Moneta alone restores control. `[DAKOTA + COUNSEL: a process for users who lose every passkey that does not recreate unilateral control.]`
- **Platform co-signer** (if 2-of-2): apply §4's lifecycle. Stealing it alone cannot move funds, but losing it blocks sends until rotated.
- **Teams:** each approver's passkey joins the org's signer group with threshold M (plan 1c.7).
- **Cards:** Dakota's card enablement already expects the customer's key to sign.
- **Migration:** for each wallet, add the user's signer and change the policy and governance, signed with the current platform key. Then remove the platform's power to act alone. Check each wallet, and log it in the audit log.

## 6. Design C (alternative): Dakota hosts the wallet

If Dakota acts as custodian, for example through the three-shard "Dakota-Supported Wallet" in its Terms, Moneta holds no signing key. This policy then reduces to the API key and the secrets in §3. `[DAKOTA: confirm in writing what Moneta's API key can and cannot do in this model.]`

## 7. `AUTH_SECRET` is more than a session key

`AUTH_SECRET` signs sessions. It is also the root for:
- the 2FA secret encryption key (`src/lib/auth/totp.ts`);
- phone-number field encryption (`src/lib/crypto/field.ts`);
- the 2FA backup-code HMAC (`src/lib/auth/backup-codes.ts`);
- the team invite HMAC (`src/lib/orgs.ts`);
- the approval payload hash (`src/lib/approvals.ts`);
- the sign-in device fingerprint (`src/lib/auth/login-devices.ts`).

The draft rotation steps in `DR-RUNBOOK.md` cover the 2FA secrets, invites and approvals. They **miss** three things:
- Phone numbers become unreadable.
- Every backup code stops working, so users must create new ones.
- Every device looks new, which sends a wave of sign-in alerts.

**To do (plan C3 follow-up):**
- Give each purpose its own key with a version ID stored next to the ciphertext, so keys can rotate without a migration.
- Until then, rotate `AUTH_SECRET` only on exposure, using the runbook plus these three items.

## 8. Key register

[ENGINEERING LEAD] keeps a register with no private material in it. For each key it records:
- name and purpose;
- public key or fingerprint, where there is one;
- when it was created, and by whom;
- where it is stored, and its backups;
- rotation dates;
- when it was destroyed.

Review the register every quarter with [QUALIFIED INDIVIDUAL].
