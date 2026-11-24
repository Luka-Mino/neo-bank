// Versions of Moneta's own legal documents. The /terms and /privacy pages show
// `updated`, and sign-up records `version` against the user. Change both
// fields together when a document changes, so what a user accepted can always
// be matched to the text they saw.
//
// Dakota's documents (its Terms, Funds Transfer Agreement, privacy policies,
// E-Sign notice) are accepted on Dakota's hosted onboarding form and recorded
// by Dakota. These are only Moneta's.

export const LEGAL_DOCS = {
  terms: { version: "2026-11-23", updated: "November 23, 2026" },
  privacy: { version: "2026-11-23", updated: "November 23, 2026" },
} as const;
