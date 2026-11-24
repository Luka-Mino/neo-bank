"use client";

// Add someone to pay. Creates the Dakota recipient (POST /api/recipients),
// then their USDC wallet destination (POST /api/recipients/[id]/destinations,
// destinationType "crypto"; the server fills in the platform network).
// Without the destination, Send has nothing to pay — the old /recipients/new
// stopped after step 1.
//
// Safety: wallet payments can't be pulled back, so the address is shown back
// in groups and must be confirmed before saving. If step 1 succeeds and step
// 2 fails, a retry only repeats step 2 (no duplicate recipients).

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FlowScreen, HelpCard } from "@/components/app/flow-screen";
import { TextField } from "@/components/app/fields";
import { AppSheet } from "@/components/app/sheet";
import { Notice, SuccessState } from "@/components/app/states";
import { postJson } from "@/components/app/api";
import { Button, ButtonLink } from "@/components/brand/button";
import { DEMO_MODE } from "@/lib/demo-data";

const ADDRESS = /^0x[0-9a-fA-F]{40}$/;

function groups(a: string): string[] {
  const body = a.slice(2);
  return ["0x", ...(body.match(/.{1,4}/g) ?? [])];
}

export function NewRecipient({ existingId, existingName }: { existingId: string | null; existingName: string | null }) {
  const qc = useQueryClient();
  const [name, setName] = useState(existingName ?? "");
  const [address, setAddress] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(existingId);
  const [done, setDone] = useState<{ destinationId: string } | null>(null);

  const cleanAddress = address.trim();
  const errors = {
    name: name.trim().length < 2 ? "Enter their full name" : undefined,
    address: !ADDRESS.test(cleanAddress) ? "Enter a wallet address: 0x followed by 40 letters and numbers" : undefined,
  };
  const valid = !errors.name && !errors.address;

  async function save() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      let rid = recipientId;
      let destinationId: string;
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 700));
        rid = rid ?? "demo-recipient";
        destinationId = "demo-destination";
      } else {
        if (!rid) {
          const r = await postJson<{ id: string }>("/api/recipients", { name: name.trim() });
          rid = r.id;
          setRecipientId(rid);
        }
        const d = await postJson<{ dakotaDestinationId: string }>(`/api/recipients/${encodeURIComponent(rid)}/destinations`, {
          destinationType: "crypto",
          name: `${name.trim()} USDC wallet`.slice(0, 60),
          cryptoAddress: cleanAddress,
          assets: ["USDC"],
        });
        destinationId = d.dakotaDestinationId;
      }
      qc.invalidateQueries({ queryKey: ["recipients"] });
      qc.invalidateQueries({ queryKey: ["destinations"] });
      setConfirming(false);
      setDone({ destinationId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn't save this. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <FlowScreen
      title={existingId ? `Add a wallet for ${existingName ?? "them"}` : "Add someone"}
      subtitle="Save their USDC wallet once, then pay them in seconds."
      back={{ href: "/app/move/recipients", label: "Recipients" }}
      aside={
        done ? undefined : (
          <>
            <HelpCard title="Which address?">
              <p>Ask them for their USDC wallet address on Base. It starts with 0x and is 42 characters long.</p>
            </HelpCard>
            <HelpCard title="Check it twice">
              <p>Money sent to the wrong address can&apos;t be recovered. Copy and paste it rather than typing it out.</p>
            </HelpCard>
          </>
        )
      }
    >
      {done ? (
        <SuccessState
          title={`${name.trim().split(" ")[0] || "They"} can be paid now`}
          body="Their wallet is saved. You'll see them in Recipients and when you send money."
          actions={
            <>
              <ButtonLink href={`/app/move/send?to=${encodeURIComponent(done.destinationId)}`} block arrow>
                Pay {name.trim().split(" ")[0] || "them"}
              </ButtonLink>
              <ButtonLink href="/app/move/recipients" variant="secondary" block>
                Done
              </ButtonLink>
            </>
          }
        />
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setShowErrors(true);
            if (valid) {
              setChecked(false);
              setError(null);
              setConfirming(true);
            }
          }}
          className="space-y-6"
        >
          <TextField
            label="Full name"
            placeholder="Their legal name"
            autoComplete="off"
            maxLength={100}
            value={name}
            disabled={!!existingId}
            onChange={(e) => setName(e.target.value)}
            error={showErrors ? errors.name : undefined}
          />
          <TextField
            label="USDC wallet address (Base)"
            placeholder="0x…"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            inputMode="text"
            className="[&_input]:font-mono [&_input]:text-[14px]"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            error={showErrors ? errors.address : undefined}
            hint="Paste it from their wallet app."
          />
          <Button type="submit" block arrow size="lg">
            Continue
          </Button>
        </form>
      )}

      <AppSheet
        open={confirming}
        onOpenChange={setConfirming}
        title="Check the address"
        description={`Payments to ${name.trim() || "this person"} will go to this wallet.`}
        busy={busy}
        footer={
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
            <Button variant="secondary" block disabled={busy} onClick={() => setConfirming(false)} className="sm:w-auto sm:flex-none">
              Edit
            </Button>
            <Button block loading={busy} disabled={!checked} onClick={save} className="sm:flex-1">
              {busy ? "Saving…" : "Save"}
            </Button>
          </div>
        }
      >
        <div className="rounded-[16px] bg-[#f3f5f4] px-4 py-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-forest/65">USDC on Base</p>
          <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[17px] font-semibold tracking-wide text-forest">
            {groups(cleanAddress).map((g, i) => (
              <span key={i} className={i === 0 ? "text-forest/65" : undefined}>
                {g}
              </span>
            ))}
          </p>
        </div>
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[12px] px-1 py-2 text-[14px] text-forest/80">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#122e2e]"
          />
          I&apos;ve checked this matches the address {name.trim().split(" ")[0] || "they"} gave me. Payments to a wrong address can&apos;t be recovered.
        </label>
        {error && (
          <Notice tone="error" className="mt-3" title="Not saved">
            {error}
          </Notice>
        )}
      </AppSheet>
    </FlowScreen>
  );
}
