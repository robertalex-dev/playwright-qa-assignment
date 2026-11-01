import { test, expect } from '@fixtures/test';
import { isSortedAscending, isSortedDescending } from '@utils/price';

test.describe('Sauce Demo — Scenario 2: sort products by price', () => {
  test('ascending (low → high) shows prices in non-decreasing order', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    await expect(inventoryPage.sortSelect).toHaveValue('lohi');

    const prices = await inventoryPage.getPrices();
    console.log('Prices low→high:', prices);

    expect(prices.length).toBeGreaterThan(1);
    expect(isSortedAscending(prices), `expected ascending order, got ${prices.join(', ')}`).toBe(true);
    // Equivalent check through a reference sort — the UI must match what we'd compute ourselves.
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('descending (high → low) shows prices in non-increasing order', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');
    await expect(inventoryPage.sortSelect).toHaveValue('hilo');

    const prices = await inventoryPage.getPrices();
    console.log('Prices high→low:', prices);

    expect(prices.length).toBeGreaterThan(1);
    expect(isSortedDescending(prices), `expected descending order, got ${prices.join(', ')}`).toBe(true);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });
});
