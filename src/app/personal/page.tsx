import { permanentRedirect } from "next/navigation";

// The retail-bank page is the homepage now (D1 in LAUNCH-READINESS-PLAN.md).
// Old /personal links and bookmarks land on it.
export default function PersonalRedirect(): never {
  permanentRedirect("/");
}
