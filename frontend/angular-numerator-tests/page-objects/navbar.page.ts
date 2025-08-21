import { Page, Locator } from "@playwright/test";

export class NavbarPage {
  readonly page: Page;
  readonly brand: Locator;
  readonly takeNumberLink: Locator;
  readonly dashboardLink: Locator;
  readonly createAdminLink: Locator;
  readonly createAgentLink: Locator;
  readonly listUsersLink: Locator;
  readonly myTicketsLink: Locator;
  readonly signInLink: Locator;
  readonly signUpLink: Locator;
  readonly logoutButton: Locator;
  readonly profileImageLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.brand = page.getByRole("link", { name: "BankNumerator" });
    // Tercihen isimle seç: sıraya bağımlı olmasın
    this.takeNumberLink = page.getByRole("link", { name: "Take Number" });
    this.dashboardLink = page.getByRole("link", { name: "Dashboard" });
    this.createAdminLink = page.getByRole("link", { name: "Create Admin" });
    this.createAgentLink = page.getByRole("link", { name: "Create Agent" });
    this.listUsersLink = page.getByRole("link", { name: "List Users" });
    this.myTicketsLink = page.getByRole("link", { name: "My Tickets" });
    this.signInLink = page.getByRole("link", { name: "Sign In" });
    this.signUpLink = page.getByRole("link", { name: "Sign Up" });
    this.logoutButton = page.getByRole("button", { name: "Logout" });
    this.profileImageLink = page.locator(".nav-avatar");
  }

  async goto(baseUrl: string) {
    await this.page.goto(baseUrl + "/");
  }
}
