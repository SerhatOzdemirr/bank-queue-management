import { Page, Locator } from "@playwright/test";

export class ProfileHeaderPage {
  readonly page: Page;

  // Avatar
  readonly avatarImg: Locator;
  readonly changeBtn: Locator;
  readonly fileInput: Locator;

  // Info
  readonly username: Locator;
  readonly email: Locator;
  readonly role: Locator;

  // Actions
  readonly editBtn: Locator;

  // Modal
  readonly modal: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly saveBtn: Locator;
  readonly cancelBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    // Avatar
    this.avatarImg = page.locator(".avatar-img");
    this.changeBtn = page.locator(".btn-change");
    this.fileInput = page.locator('input[type = "file"]');

    // Info
    this.username = page.locator(".username");
    this.email = page.locator(".email");
    this.role = page.locator(".role");

    // Actions
    this.editBtn = page.getByRole("button", { name: "Edit" });

    // Modal
    this.modal = page.locator(".modal");
    this.nameInput = page.locator('input[name="name"]');
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.saveBtn = this.modal.locator('button[type="submit"]');
    this.cancelBtn = this.modal.locator("button", { hasText: "Cancel" });
  }

  async navigateTo(baseUrl: string) {
    await this.page.goto(`${baseUrl}/profile`);
  }

  async openEditModal() {
    await this.editBtn.click();
    await this.modal.waitFor();
  }

  async closeEditModal() {
    await this.cancelBtn.click();
    await this.modal.waitFor({ state: "detached" });
  }

  async updateProfile(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.saveBtn.click();
  }
}
