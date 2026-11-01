/**
 * Money helpers. Everything is done in integer cents so that
 * 49.99 + 29.99 + 15.99 doesn't become 95.97000000000001 and break an equality assertion.
 */

export interface Product {
  name: string;
  price: number;
}

/** "$49.99" | "Item total: $95.97" → 49.99 */
export function parsePrice(text: string): number {
  const match = text.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  if (!match) throw new Error(`No numeric price found in: "${text}"`);
  return Number(match[0]);
}

export const toCents = (amount: number): number => Math.round(amount * 100);
export const fromCents = (cents: number): number => cents / 100;

/** Sum of prices, computed in cents, returned as a float with 2 decimals. */
export function sumPrices(items: readonly Product[]): number {
  return fromCents(items.reduce((acc, p) => acc + toCents(p.price), 0));
}

/**
 * Top-N by price, descending. Ties are broken alphabetically so the result is deterministic
 * (Sauce Demo has two products at $15.99, which matters when N = 3).
 */
export function topByPrice<T extends Product>(items: readonly T[], n: number): T[] {
  return [...items]
    .sort((a, b) => b.price - a.price || a.name.localeCompare(b.name))
    .slice(0, n);
}

export function isSortedAscending(values: readonly number[]): boolean {
  return values.every((v, i) => i === 0 || (values[i - 1] as number) <= v);
}

export function isSortedDescending(values: readonly number[]): boolean {
  return values.every((v, i) => i === 0 || (values[i - 1] as number) >= v);
}

export const formatUsd = (amount: number): string => `$${amount.toFixed(2)}`;
