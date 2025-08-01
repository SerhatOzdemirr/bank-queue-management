import { Locator, Page } from "@playwright/test";

export class AdminSignupPage {
  readonly page: Page;
  readonly adminCreateButton: Locator;
  readonly adminUsername: Locator;
  readonly adminEmail: Locator;
  readonly adminPassword: Locator;
  readonly adminTitle: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.adminCreateButton = page.getByRole("button", { name: "Create Admin" });
    this.adminUsername = page.getByPlaceholder("Username");
    this.adminEmail = page.getByPlaceholder("Email");
    this.adminPassword = page.getByPlaceholder("Password");
    this.adminTitle = page.locator(".admin-title");
    this.successMessage = page.locator(".success");
    this.errorMessage = page.locator(".error");
  }

  async navigateTo(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/admin/create`);
  }
  async navigateToAdmin(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/admin`);
  }

  async createAdmin(
    username: string,
    email: string,
    password: string
  ): Promise<void> {
    await this.adminUsername.fill(username);
    await this.adminEmail.fill(email);
    await this.adminPassword.fill(password);
    await this.adminCreateButton.click();
  }
  async getSuccessMessage(): Promise<string | null> {
    return await this.successMessage.textContent();
  }
  async getErrorMessage(): Promise<string | null> {
    return await this.errorMessage.textContent();
  }

}
