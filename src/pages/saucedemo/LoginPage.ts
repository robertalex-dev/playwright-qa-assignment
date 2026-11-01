import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { config } from '@data/env';

export class LoginPage extends BasePage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page, config.sauce.baseUrl);
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error');
  }

  async login(
    username: string = config.sauce.username,
    password: string = config.sauce.password,
  ): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
