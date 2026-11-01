import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { checkoutCustomer, config } from '@data/env';
import { parsePrice } from '@utils/price';

/**
 * Sauce Demo's checkout is three screens (step-one form, step-two overview, complete).
 * They're small enough that one page object with grouped locators reads better than
 * three classes a test has to juggle.
 */
export class CheckoutPage extends BasePage {
  static readonly stepOnePath = '/checkout-step-one.html';
  static readonly stepTwoPath = '/checkout-step-two.html';
  static readonly completePath = '/checkout-complete.html';

  // Step one — customer info
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;

  // Step two — overview
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  // Complete
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page, config.sauce.baseUrl + CheckoutPage.stepOnePath);
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');

    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');

    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async fillCustomerInfo(customer = checkoutCustomer): Promise<void> {
    await this.firstName.fill(customer.firstName);
    await this.lastName.fill(customer.lastName);
    await this.postalCode.fill(customer.postalCode);
    await this.continueButton.click();
  }

  /** "Item total: $95.97" → 95.97 */
  async getItemTotal(): Promise<number> {
    return parsePrice(await this.subtotalLabel.innerText());
  }

  async getTax(): Promise<number> {
    return parsePrice(await this.taxLabel.innerText());
  }

  async getTotal(): Promise<number> {
    return parsePrice(await this.totalLabel.innerText());
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}
