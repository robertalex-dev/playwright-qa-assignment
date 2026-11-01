import type { FrameLocator, Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { config } from '@data/env';

/**
 * Nested frames with identical button markup:
 *   page → iframe#frame-outer (srcdoc) → iframe#frame-inner (srcdoc)
 *
 * Each frame has its own `#result` div, updated to "Button pressed: <label>" by its own
 * showResult(). Because the markup is the same in both frames, every locator *must* be
 * rooted in the right FrameLocator — a page-level `getByRole('button', {name:'Edit'})`
 * would be ambiguous (strict mode violation) or hit the wrong frame.
 */
export class FramesPage extends BasePage {
  readonly outerFrame: FrameLocator;
  readonly innerFrame: FrameLocator;

  constructor(page: Page) {
    super(page, `${config.playground.baseUrl}/frames`);
    this.outerFrame = page.frameLocator('#frame-outer');
    this.innerFrame = this.outerFrame.frameLocator('#frame-inner');
  }

  /** Both frames, in the order the task walks them. */
  get frames(): Array<{ name: string; frame: FrameLocator }> {
    return [
      { name: 'outer (level 1)', frame: this.outerFrame },
      { name: 'inner (level 2)', frame: this.innerFrame },
    ];
  }

  /**
   * One locator strategy per button, mirroring the strategies the page itself advertises:
   * data-* attribute, text, name attribute, class. Returned together with the label the
   * frame will echo back, so the spec can assert without re-deriving it.
   */
  buttonsIn(frame: FrameLocator): Array<{ label: string; locator: Locator }> {
    return [
      { label: 'Edit', locator: frame.locator('button[data-action="edit"]') },
      { label: 'Submit', locator: frame.getByRole('button', { name: 'Submit', exact: true }) },
      { label: 'Click me', locator: frame.locator('button[name="my-button"]') },
      { label: 'Primary', locator: frame.locator('button.btn-class') },
    ];
  }

  resultIn(frame: FrameLocator): Locator {
    return frame.locator('#result');
  }
}
