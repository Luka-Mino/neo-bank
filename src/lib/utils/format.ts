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
      return "text-green-600 bg-green-50";
    case "pending":
    case "processing":
    case "in_progress":
      return "text-yellow-600 bg-yellow-50";
    case "failed":
    case "rejected":
    case "canceled":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}
