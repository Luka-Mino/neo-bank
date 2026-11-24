// Legal document layout (Terms, Privacy, …), modelled on a fintech help-
// centre legal page: breadcrumb, title + one-line summary, "last updated",
// a plain-language summary, an all-caps disclosure box, numbered sections
// with numbered sub-clauses, and a sidebar listing every legal document
// plus the sections of the one you're reading.

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const LEGAL_DOCS = [
  { href: "/terms", title: "Terms of use" },
  { href: "/privacy", title: "Privacy policy" },
] as const;

export type LegalSection = { id: string; n: number; title: string };

export function LegalPage({
  current,
  title,
  subtitle,
  updated,
  draft = false,
  sections,
  children,
}: {
  current: (typeof LEGAL_DOCS)[number]["href"];
  title: string;
  subtitle: string;
  updated: string;
  /** Shows a "draft for legal review" banner. */
  draft?: boolean;
  sections: LegalSection[];
  children: ReactNode;
}) {
  return (
    <div className="bg-white">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14 lg:px-8 lg:py-14">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto">
          <nav aria-label="Legal documents">
            <p className="eyebrow text-[10px] text-forest/65">Legal &amp; policies</p>
            <ul className="mt-3 flex gap-2 overflow-x-auto lg:flex-col lg:gap-0.5">
              {LEGAL_DOCS.map((d) => {
                const on = d.href === current;
                return (
                  <li key={d.href} className="shrink-0">
                    <Link
                      href={d.href}
                      aria-current={on ? "page" : undefined}
                      className={cn(
                        "block rounded-[10px] px-3 py-2 text-[14px] font-medium transition",
                        on ? "bg-turquoise-50 text-forest ring-1 ring-turquoise/30" : "text-forest/65 hover:bg-forest/[0.03] hover:text-forest"
                      )}
                    >
                      {d.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {sections.length > 0 && (
            <nav aria-label="On this page" className="mt-8 hidden lg:block">
              <p className="eyebrow text-[10px] text-forest/65">On this page</p>
              <ol className="mt-3 space-y-0.5 border-l border-forest/10">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-[13px] text-forest/65 transition hover:border-turquoise hover:text-forest"
                    >
                      {s.n}. {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </aside>

        {/* Document */}
        <article className="min-w-0 max-w-[760px]">
          <nav aria-label="Breadcrumb" className="text-[13px] text-forest/65">
            <Link href={LEGAL_DOCS[0].href} className="hover:text-forest hover:underline">
              Legal &amp; policies
            </Link>
          </nav>
          <h1 className="mt-3 font-display text-[34px] font-semibold leading-[1.1] tracking-[-0.015em] text-forest lg:text-[42px]">{title}</h1>
          <p className="mt-2 text-[17px] text-forest/65">{subtitle}</p>
          <p className="mt-4 text-[13px] text-forest/65">Last updated {updated}</p>
          {draft && (
            <div role="note" className="mt-6 rounded-[14px] border border-dashed border-[#e0a030] bg-[#fff8e8] px-4 py-3 text-[13.5px] leading-relaxed text-[#6b4a00]">
              <span className="font-semibold">Draft for legal review.</span> This document hasn&apos;t been approved by counsel yet. Highlighted
              items are placeholders.
            </div>
          )}
          <div className="mt-8 text-[15px] leading-[1.75] text-forest/80">{children}</div>
        </article>
      </div>
    </div>
  );
}

/** Plain-language summary at the top of a document. */
export function LegalSummary({ children }: { children: ReactNode }) {
  return (
    <section aria-labelledby="summary" className="mb-8">
      <h2 id="summary" className="text-[18px] font-semibold text-forest">
        Summary
      </h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

/** The bold, all-caps disclosure box (regulatory status, not-a-bank). */
export function CapsBox({ children }: { children: ReactNode }) {
  return (
    <div className="mb-10 rounded-[14px] border border-forest/15 bg-[#f3f5f4] px-5 py-4 text-[13px] font-semibold uppercase leading-relaxed tracking-[0.01em] text-forest">
      {children}
    </div>
  );
}

/** Numbered section: "4. Your account and security". */
export function LegalSection({ section, children }: { section: LegalSection; children: ReactNode }) {
  return (
    <section id={section.id} aria-labelledby={`${section.id}-h`} className="scroll-mt-32 border-t border-forest/[0.08] py-7 first-of-type:border-t-0">
      <h2 id={`${section.id}-h`} className="text-[20px] font-semibold tracking-[-0.005em] text-forest">
        {section.n}. {section.title}
      </h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

/** Numbered sub-clause: "4.2 Two-step sign-in." followed by text. */
export function Clause({ n, title, children }: { n: string; title?: string; children: ReactNode }) {
  return (
    <p>
      <span className="font-semibold text-forest">
        {n}
        {title ? ` ${title}.` : ""}
      </span>{" "}
      {children}
    </p>
  );
}

/** A defined term, bold and in quotes, e.g. <Term>Moneta Account</Term>. */
export function Term({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-forest">&ldquo;{children}&rdquo;</strong>;
}

/** All-caps paragraph for disclaimers inside a section. */
export function Caps({ children }: { children: ReactNode }) {
  return <p className="text-[13.5px] font-semibold uppercase leading-relaxed tracking-[0.01em] text-forest/85">{children}</p>;
}
