import type { MessageCategory } from "../types";

/**
 * Default country and category for the credit estimator.
 * US is chosen as a globally-recognized default; users can change it.
 */
export const DEFAULT_COUNTRY = "US";
export const DEFAULT_CATEGORY: MessageCategory = "authentication";

/**
 * Curated list of countries with high WhatsApp Business usage.
 * Backend expects ISO 3166-1 alpha-2 codes.
 *
 * Sorted by typical OTP-platform volume so users can pick quickly.
 */
export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: CountryOption[] = [
  // Top markets first
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },

  // MENA region
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
  { code: "JO", name: "Jordan", flag: "🇯🇴" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧" },

  // Other significant markets
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
];

/**
 * Find country option by ISO code. Returns the US default if not found.
 */
export function findCountry(code: string): CountryOption {
  return (
    COUNTRIES.find((c) => c.code === code) ??
    COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY)!
  );
}

/**
 * Categories available for cost estimation.
 */
export const CATEGORIES: { id: MessageCategory; label: string; description: string }[] = [
  {
    id: "authentication",
    label: "Authentication",
    description: "OTPs and verification codes",
  },
  {
    id: "utility",
    label: "Utility",
    description: "Transactional updates",
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Promotional messages",
  },
];

/**
 * Format a currency value with the given currency code.
 * Falls back gracefully if Intl.NumberFormat throws.
 */
export function formatCurrency(value: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 4 : 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

/**
 * Calculate how many messages a user can send with a given budget.
 */
export function calculateMessageCount(
  budget: number,
  costPerMessage: number
): number {
  if (costPerMessage <= 0 || budget <= 0) return 0;
  return Math.floor(budget / costPerMessage);
}

/**
 * Format a large number with K/M abbreviations.
 */
export function formatMessageCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 10_000) return `${(count / 1_000).toFixed(0)}K`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toLocaleString();
}