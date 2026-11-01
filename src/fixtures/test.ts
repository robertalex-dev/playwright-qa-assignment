import { test as base, expect } from '@playwright/test';
import { LoginPage } from '@pages/saucedemo/LoginPage';
import { InventoryPage } from '@pages/saucedemo/InventoryPage';
import { CartPage } from '@pages/saucedemo/CartPage';
import { CheckoutPage } from '@pages/saucedemo/CheckoutPage';
import { ScrollToClickPage } from '@pages/playground/ScrollToClickPage';
import { UploadPage } from '@pages/playground/UploadPage';
import { SelectPage } from '@pages/playground/SelectPage';
import { FramesPage } from '@pages/playground/FramesPage';
import { DummyJsonClient } from '@api/DummyJsonClient';

/**
 * Custom fixtures = dependency injection for page objects.
 * Specs ask for exactly the pages they need in the test signature; construction,
 * and for `inventoryPage` the login itself, happens here once per test.
 */
type Fixtures = {
  loginPage: LoginPage;
  /** Inventory page with the user already logged in and the page loaded. */
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;

  scrollToClickPage: ScrollToClickPage;
  uploadPage: UploadPage;
  selectPage: SelectPage;
  framesPage: FramesPage;

  dummyJson: DummyJsonClient;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page, loginPage }, use) => {
    await loginPage.goto();
    await loginPage.login();
    const inventoryPage = new InventoryPage(page);
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.items.first()).toBeVisible();
    await use(inventoryPage);
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  scrollToClickPage: async ({ page }, use) => {
    await use(await new ScrollToClickPage(page).goto());
  },

  uploadPage: async ({ page }, use) => {
    await use(await new UploadPage(page).goto());
  },

  selectPage: async ({ page }, use) => {
    await use(await new SelectPage(page).goto());
  },

  framesPage: async ({ page }, use) => {
    await use(await new FramesPage(page).goto());
  },

  dummyJson: async ({ request }, use) => {
    await use(new DummyJsonClient(request));
  },
});

export { expect };
