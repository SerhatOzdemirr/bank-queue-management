import { Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput;
  readonly passwordInput;
  readonly signInButton;
  readonly loginError;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder("Email");
    this.passwordInput = page.getByPlaceholder("Password");
    this.loginError = page.locator(".login-error");
    this.signInButton = page.getByRole("button", { name: "Sign In" });
  }

  async navigateTo(baseurl : string): Promise<void> {
    await this.page.goto(`${baseurl}/login`);
  }
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
  async getErrorMessage() : Promise<string>{
    return await this.loginError.textContent();
  }
}
