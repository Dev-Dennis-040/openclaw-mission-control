export function getApiBaseUrl(): string {
  if (typeof window === "undefined" && process.env.INTERNAL_API_URL) {
    const internal = process.env.INTERNAL_API_URL.replace(/\/+$/, "");
    if (internal) return internal;
  }
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) {
    throw new Error("NEXT_PUBLIC_API_URL is not set.");
  }
  const normalized = raw.replace(/\/+$/, "");
  if (!normalized) {
    throw new Error("NEXT_PUBLIC_API_URL is invalid.");
  }
  return normalized;
}
