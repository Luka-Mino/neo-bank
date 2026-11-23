"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

// Link that glides to an in-page section (#id) when the target is on the
// current page, instead of going through a router navigation (which made the
// jump feel abrupt). Cross-page links fall through to a normal <Link>.
// Honors prefers-reduced-motion. Section offsets come from scroll-margin-top
// (scroll-mt-*) on the target, so the sticky header never covers it.
export function SectionLink({
  href,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const hashAt = href.indexOf("#");
    if (hashAt === -1) return;
    const path = href.slice(0, hashAt);
    const id = href.slice(hashAt + 1);
    if (path && path !== pathname) return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    window.history.pushState(null, "", `#${id}`);
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
