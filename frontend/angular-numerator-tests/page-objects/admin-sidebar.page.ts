import { Locator, Page } from "@playwright/test";

export class AdminSidebarPage {
  readonly page: Page;
  readonly dashboardLink: Locator;
  readonly servicesManagementLink: Locator;
  readonly ticketOversightLink: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardLink = this.page.locator("a.active", {
      hasText: "Dashboard",
    });

    this.servicesManagementLink = this.page.getByRole("link", {
      name: "Service Management",
    });
    this.ticketOversightLink = this.page.getByRole("link", {
      name: "Ticket Oversight",
    });
    this.logoutLink = this.page.locator(".logout-link");
  }

  async logout() {
    await this.logoutLink.click();
  }
  async gotoDashboard() {
    await this.dashboardLink.click();
  }
  async gotoServiceManagement() {
    await this.servicesManagementLink.click();
  }
  async gotoTicketOversight() {
    await this.ticketOversightLink.click();
  }
  async navigateTo(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/admin`);
  }
}
