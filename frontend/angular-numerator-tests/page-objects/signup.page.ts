import { Page } from "@playwright/test";

export class SignupPage {
  readonly page: Page;
  readonly emailField;
  readonly passwordField;
  readonly usernameField;
  readonly signupError;
  readonly signupButton;

  constructor(page: Page) {
    this.page = page;
    this.emailField = this.page.getByPlaceholder("Email");
    this.passwordField = this.page.getByPlaceholder("Password");
    this.usernameField = this.page.getByPlaceholder("Username");
    this.signupError = this.page.locator(".signup-error");
    this.signupButton = this.page.getByRole("button", { name: "Sign Up" });
  }

  async navigateTo(baseurl: string): Promise<void> {
    await this.page.goto(`${baseurl}/signup`);
  }
  async signup(username: string, email: string, password: string) {
    await this.usernameField.fill(username);
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.signupButton.click();
  }
  async getErrorMessage(): Promise<string> {
    return await this.signupError.textContent();
  }
}
