// Password strength helpers used server-side by register/change/reset.
// The zod schemas enforce length/character rules; this adds a common-password
// screen so obviously weak choices (even if they meet the char rules, e.g.
// "Password1") are refused at the API — matching the guidance NIST gives.

// A compact set of the most-abused passwords and Moneta-obvious guesses.
// Not exhaustive (a full breach-corpus check via HIBP k-anonymity is a later
// upgrade), but it catches the choices attackers try first.
const COMMON = new Set(
  [
    "password", "password1", "password123", "passw0rd", "p@ssw0rd", "12345678",
    "123456789", "1234567890", "qwerty123", "qwertyuiop", "letmein1", "welcome1",
    "admin123", "iloveyou1", "monkey123", "dragon123", "sunshine1", "princess1",
    "football1", "baseball1", "abc12345", "changeme1", "trustno1", "master123",
    "shadow123", "superman1", "batman123", "michael1", "jennifer1", "computer1",
    "moneta123", "moneta2026", "bank12345", "money1234", "test1234", "demo1234",
  ].map((p) => p.toLowerCase())
);

/**
 * Returns an error message if the password is too weak beyond the char rules,
 * or null if acceptable. Screens exact common passwords, trivial repeats, and
 * simple sequences.
 */
export function screenPassword(
  password: string,
  context?: { email?: string; name?: string }
): string | null {
  const lower = password.toLowerCase();

  if (COMMON.has(lower)) {
    return "That password is too common. Choose something less guessable.";
  }
  // All one character, or short runs of one character.
  if (/^(.)\1+$/.test(password)) {
    return "Choose a password that isn't a single repeated character.";
  }
  // Straight numeric or alphabetic sequences.
  if (
    /^(0123456789|1234567890|abcdefghij|qwertyuiop)/.test(lower) &&
    lower.length <= 12
  ) {
    return "Avoid simple sequences like 12345678 or qwerty.";
  }
  // Don't let the password be (or contain) the email local-part or name.
  const emailLocal = context?.email?.split("@")[0]?.toLowerCase();
  if (emailLocal && emailLocal.length >= 4 && lower.includes(emailLocal)) {
    return "Don't base your password on your email address.";
  }
  const name = context?.name?.toLowerCase().replace(/\s+/g, "");
  if (name && name.length >= 4 && lower.includes(name)) {
    return "Don't base your password on your name.";
  }
  return null;
}
