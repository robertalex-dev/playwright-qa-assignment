import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { config } from '@data/env';
import { parsePrice, type Product } from '@utils/price';

/** Values of the sort <select> on the inventory page. */
export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  static readonly path = '/inventory.html';

  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortSelect: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page, config.sauce.baseUrl + InventoryPage.path);
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  /** Scrapes every product card into { name, price } — nothing hardcoded. */
  async getProducts(): Promise<Product[]> {
    const [names, prices] = await Promise.all([
      this.itemNames.allTextContents(),
      this.itemPrices.allTextContents(),
    ]);
    if (names.length !== prices.length) {
      throw new Error(`Name/price mismatch: ${names.length} names vs ${prices.length} prices`);
    }
    return names.map((name, i) => ({ name: name.trim(), price: parsePrice(prices[i] as string) }));
  }

  async getPrices(): Promise<number[]> {
    const texts = await this.itemPrices.allTextContents();
    return texts.map(parsePrice);
  }

  /** Scoped to the product card, so two products with the same price can't collide. */
  private cardByName(name: string): Locator {
    return this.items.filter({ has: this.page.getByTestId('inventory-item-name').filter({ hasText: name }) });
  }

  async addToCart(name: string): Promise<void> {
    await this.cardByName(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async addAllToCart(names: readonly string[]): Promise<void> {
    for (const name of names) await this.addToCart(name);
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
