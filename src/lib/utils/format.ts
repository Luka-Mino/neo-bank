export function formatCurrency(amount: string | number, currency = "USD"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatCrypto(amount: string | number, asset: string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })} ${asset}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function shortenAddress(address: string, chars = 6): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "text-primary bg-primary/10";
    case "pending":
    case "processing":
    case "in_progress":
      return "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30";
    case "failed":
    case "rejected":
    case "canceled":
      return "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30";
    default:
      return "text-muted-foreground bg-muted";
  }
}
