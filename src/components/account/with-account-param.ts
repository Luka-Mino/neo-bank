// Tiny helper that re-attaches the current `?account=` to an internal href.
//
// Why: account-scoped pages should preserve scope across navigation, so
// clicking "Send" from a checking-scoped dashboard should land on
// /send?account=<checking-id> with the source picker pre-filled. Without this,
// every nav click drops scope and the user has to re-select.
//
// Usage:
//   const href = withAccountParam("/send", searchParams);
//   <Link href={href}>Send</Link>

import type { ReadonlyURLSearchParams } from "next/navigation";

export function withAccountParam(
  href: string,
  searchParams: ReadonlyURLSearchParams | URLSearchParams | null | undefined
): string {
  const account = searchParams?.get("account");
  if (!account) return href;

  // If href already has its own ?account= (e.g. caller is doing something
  // explicit), respect it.
  const [path, existing = ""] = href.split("?");
  const params = new URLSearchParams(existing);
  if (params.has("account")) return href;

  params.set("account", account);
  return `${path}?${params.toString()}`;
}
