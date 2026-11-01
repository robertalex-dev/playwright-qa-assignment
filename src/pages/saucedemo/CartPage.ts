import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { config } from '@data/env';
import { parsePrice, type Product } from '@utils/price';

export class CartPage extends BasePage {
  static readonly path = '/cart.html';

  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page, config.sauce.baseUrl + CartPage.path);
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async getProducts(): Promise<Product[]> {
    const [names, prices] = await Promise.all([
      this.itemNames.allTextContents(),
      this.itemPrices.allTextContents(),
    ]);
    return names.map((name, i) => ({ name: name.trim(), price: parsePrice(prices[i] as string) }));
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
