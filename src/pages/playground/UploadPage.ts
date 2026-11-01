import type { FrameLocator, Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { config } from '@data/env';

/**
 * The upload widget is a React app rendered inside an <iframe src="/static/upload.html">.
 * All locators are therefore built off a FrameLocator, not the page.
 *
 * The real <input type="file" id="browse"> is `hidden` and `multiple`; the visible
 * "Browse files" button just forwards the click. setInputFiles() targets the input
 * directly, bypassing the native file dialog entirely — no need to click anything.
 */
export class UploadPage extends BasePage {
  readonly frame: FrameLocator;
  readonly fileInput: Locator;
  readonly browseButton: Locator;
  readonly fileItems: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page, `${config.playground.baseUrl}/upload`);
    this.frame = page.frameLocator('iframe[src*="upload"]');
    this.fileInput = this.frame.locator('input#browse');
    this.browseButton = this.frame.locator('.browse-btn');
    this.fileItems = this.frame.locator('.file-item');
    this.successMessage = this.frame.locator('.success-file');
  }

  async uploadFiles(paths: readonly string[]): Promise<void> {
    await this.fileInput.setInputFiles([...paths]);
  }

  async getUploadedFileNames(): Promise<string[]> {
    const names = await this.fileItems.locator('.file-info p').allTextContents();
    return names.map((n) => n.trim());
  }
}
