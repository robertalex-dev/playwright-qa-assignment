import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { config } from '@data/env';

/** Target state for the scenario — keyed by the <select> ids the summary line uses. */
export interface SelectionTargets {
  language: string;
  city: string;
  product: string;
  colors: string[];
  fruits: string[];
}

/**
 * Five native <select> controls (3 single, 2 multi) and an #opstatus summary line
 * that the page rebuilds on every change as `id: text | id: text`.
 *
 * Two traps on this page, both handled by selecting by *value* instead of visible text:
 *  - City options contain non-breaking spaces ("New\u00A0York") — selecting by label "New York" would miss.
 *  - "Release 3.0" vs "Release 3.0 Beta" look alike; values (v3.0 / v3.0-beta) are unambiguous.
 *
 * On a <select multiple>, selectOption([...]) *replaces* the current selection, so the
 * pre-selected fruits (Apple, Cherry, Grape) are cleared implicitly when we pick Date.
 */
export class SelectPage extends BasePage {
  readonly language: Locator;
  readonly city: Locator;
  readonly product: Locator;
  readonly colors: Locator;
  readonly fruits: Locator;
  readonly summary: Locator;

  constructor(page: Page) {
    super(page, `${config.playground.baseUrl}/select`);
    this.language = page.locator('#selectLanguage');
    this.city = page.locator('#selectCity');
    this.product = page.locator('#selectProduct');
    this.colors = page.locator('#selectColors');
    this.fruits = page.locator('#selectFruits');
    this.summary = page.locator('#opstatus');
  }

  async applySelections(targets: SelectionTargets): Promise<void> {
    await this.language.selectOption({ value: targets.language });
    await this.city.selectOption({ value: targets.city });
    await this.product.selectOption({ value: targets.product });
    await this.colors.selectOption(targets.colors.map((value) => ({ value })));
    await this.fruits.selectOption(targets.fruits.map((value) => ({ value })));
  }

  /** Raw summary text with NBSP folded to a normal space, for a plain string equality check. */
  async getSummaryText(): Promise<string> {
    const text = await this.summary.innerText();
    return text.replace(/\u00A0/g, ' ').trim();
  }
}
