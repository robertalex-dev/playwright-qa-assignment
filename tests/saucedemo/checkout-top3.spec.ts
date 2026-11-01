import { test, expect } from '@fixtures/test';
import { formatUsd, sumPrices, topByPrice } from '@utils/price';

const TOP_N = 3;

test.describe('Sauce Demo — Scenario 1: order the three most expensive products', () => {
  test('logs in, picks top 3 by price dynamically, validates cart and subtotal, completes the order', async ({
    page,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    // Step 2 — scrape every product from the UI and log it
    const products = await test.step('Extract all products from the inventory', async () => {
      const all = await inventoryPage.getProducts();
      expect(all.length, 'inventory should list at least one product').toBeGreaterThan(0);
      console.table(all);
      return all;
    });

    // Step 3 — pick top 3 by price, computed, not hardcoded
    const topProducts = topByPrice(products, TOP_N);
    const expectedSubtotal = sumPrices(topProducts);
    expect(topProducts).toHaveLength(TOP_N);
    console.log(`Top ${TOP_N} by price:`, topProducts.map((p) => `${p.name} (${formatUsd(p.price)})`));
    console.log(`Expected Item total: ${formatUsd(expectedSubtotal)}`);

    // Step 4 — add them to the cart
    await test.step('Add top products to cart', async () => {
      await inventoryPage.addAllToCart(topProducts.map((p) => p.name));
      await expect(inventoryPage.cartBadge).toHaveText(String(TOP_N));
    });

    // Step 5 — cart contains exactly those products at the same prices
    await test.step('Verify cart contents and prices', async () => {
      await inventoryPage.openCart();
      await expect(page).toHaveURL(/\/cart\.html$/);
      await expect(cartPage.items).toHaveCount(TOP_N);

      const cartProducts = await cartPage.getProducts();
      // Order-insensitive comparison on {name, price}: what's in the cart is exactly what we chose.
      expect(cartProducts).toEqual(expect.arrayContaining(topProducts));
      expect(topProducts).toEqual(expect.arrayContaining(cartProducts));
    });

    // Step 6 — checkout subtotal equals the sum of the prices we extracted
    await test.step('Proceed to checkout and validate Item total', async () => {
      await cartPage.proceedToCheckout();
      await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
      await checkoutPage.fillCustomerInfo();
      await expect(page).toHaveURL(/\/checkout-step-two\.html$/);

      await expect(checkoutPage.subtotalLabel).toHaveText(`Item total: ${formatUsd(expectedSubtotal)}`);
      expect(await checkoutPage.getItemTotal()).toBe(expectedSubtotal);

      // Bonus consistency check: total shown == subtotal + tax (in cents, to dodge float noise).
      const [tax, total] = await Promise.all([checkoutPage.getTax(), checkoutPage.getTotal()]);
      expect(Math.round(total * 100)).toBe(Math.round(expectedSubtotal * 100) + Math.round(tax * 100));
    });

    // Step 7 — place the order
    await test.step('Finish the order and verify the success message', async () => {
      await checkoutPage.finish();
      await expect(page).toHaveURL(/\/checkout-complete\.html$/);
      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    });

    // Step 8 — back to inventory
    await test.step('Return to inventory via Back Home', async () => {
      await checkoutPage.backHome();
      await expect(page).toHaveURL(/\/inventory\.html$/);
      await expect(inventoryPage.title).toHaveText('Products');
      await expect(inventoryPage.cartBadge).toBeHidden();
    });
  });
});
