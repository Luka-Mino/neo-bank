// Structured JSON logger. One line per event with a level, message key, and
// context object — greppable, machine-parseable, and safe: secret/PII-looking
// keys are redacted before anything is written. Replaces scattered raw
// console.* in server code.

type Level = "debug" | "info" | "warn" | "error";

const REDACT_KEYS =
  /pass|secret|token|api.?key|private|authorization|cookie|ssn|card|cvv|account_number|routing/i;

function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[deep]";
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = REDACT_KEYS.test(k) ? "[redacted]" : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

function emit(level: Level, message: string, context?: Record<string, unknown>) {
  const line = {
    level,
    msg: message,
    ...(context ? { ctx: redact(context) } : {}),
  };
  const serialized = JSON.stringify(line);
  if (level === "error") console.error(serialized);
  else if (level === "warn") console.warn(serialized);
  else console.log(serialized);
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) =>
    process.env.NODE_ENV !== "production" && emit("debug", msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => emit("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => emit("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => emit("error", msg, ctx),
};
