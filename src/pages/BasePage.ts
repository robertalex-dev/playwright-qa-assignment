import type { Page } from '@playwright/test';

/**
 * Thin base: every page knows its own absolute URL, so tests never build URLs themselves.
 * Subclasses expose locators as readonly fields (built once in the constructor, lazy by nature)
 * and intent-level actions; assertions stay in the specs.
 */
export abstract class BasePage {
  protected constructor(
    protected readonly page: Page,
    protected readonly url: string,
  ) {}

  async goto(): Promise<this> {
    await this.page.goto(this.url);
    return this;
  }
}
