import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { config } from '@data/env';

/**
 * Four buttons, four different "out of reach" situations:
 *  1. far below the fold (page scroll)
 *  2. inside a scrollable container (scroll right + down)
 *  3. nested scrollable containers (outer first, then inner)
 *  4. `visibility:hidden` until the parent row is hovered
 *
 * Playwright's actionability checks already scroll an element into view before clicking —
 * including through nested scroll containers — so cases 1–3 are handled by a plain click.
 * We still call scrollIntoViewIfNeeded() explicitly to make the intent of the task visible
 * and to produce a clear failure point if scrolling itself breaks. Case 4 needs a hover first,
 * because actionability requires the element to be *visible*, and hidden-until-hover never is.
 */
export class ScrollToClickPage extends BasePage {
  readonly pageScrollButton: Locator;
  readonly containerScrollButton: Locator;
  readonly nestedScrollButton: Locator;
  readonly hoverRow: Locator;
  readonly hoverRevealButton: Locator;
  readonly progressText: Locator;

  constructor(page: Page) {
    super(page, `${config.playground.baseUrl}/scrolltoclick`);
    this.pageScrollButton = page.locator('#scrollTarget1');
    this.containerScrollButton = page.locator('#scrollTarget2');
    this.nestedScrollButton = page.locator('#scrollTarget3');
    this.hoverRow = page.locator('#targetRow4');
    this.hoverRevealButton = page.locator('#scrollTarget4');
    this.progressText = page.locator('#progressText');
  }

  private async scrollAndClick(button: Locator): Promise<void> {
    await button.scrollIntoViewIfNeeded();
    await button.click();
  }

  async clickAllButtons(): Promise<void> {
    await this.scrollAndClick(this.pageScrollButton);
    await this.scrollAndClick(this.containerScrollButton);
    await this.scrollAndClick(this.nestedScrollButton);

    await this.hoverRow.scrollIntoViewIfNeeded();
    await this.hoverRow.hover();
    await this.hoverRevealButton.click();
  }

  /** The buttons are the only ones that turn green; useful for a per-button assertion. */
  get allTargetButtons(): Locator[] {
    return [
      this.pageScrollButton,
      this.containerScrollButton,
      this.nestedScrollButton,
      this.hoverRevealButton,
    ];
  }
}
