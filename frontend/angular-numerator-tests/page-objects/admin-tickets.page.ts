import { Page, Locator, expect } from "@playwright/test";

export class AdminTicketsPage {
  readonly page: Page;

  readonly header: Locator;
  readonly serviceSelect: Locator;
  readonly refreshButton: Locator;
  readonly loadingText: Locator;
  readonly noTicketsText: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;

  constructor(page: Page) {
    this.page = page;

    this.header = page.getByRole("heading", {
      name: "Service-Based Ticket Management",
    });
    this.serviceSelect = page.locator("#svcSelect");
    this.refreshButton = page.getByRole("button", { name: "Refresh" });
    this.loadingText = page.getByText("Loading...");
    this.noTicketsText = page.getByText("No tickets to display.");
    this.table = page.locator("table");
    this.tableRows = page.locator("tbody tr");
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/admin/tickets`);
    await expect(this.header).toBeVisible();
  }

  async selectService(serviceKey: string) {
    await this.serviceSelect.selectOption(serviceKey);
     
  }

  async selectAllServices() {
    await this.serviceSelect.selectOption(""); // — All —
  }

  async clickRefresh() {
    await this.refreshButton.click();
  }

  async waitForLoadingToFinish() {
    await expect(this.loadingText).toHaveCount(0);
  }

  async expectNoTickets() {
    await expect(this.noTicketsText).toBeVisible();
  }

  async expectTicketsCount(count: number) {
    await expect(this.tableRows).toHaveCount(count);
  }

  async cancelTicketByIndex(rowIndex: number) {
    this.page.once("dialog", async (dialog) => {
      await dialog.accept();
    });
    await this.tableRows
      .nth(rowIndex)
      .getByRole("button", { name: "Cancel" })
      .click();
  }

  async expectTicketNotExists(serviceKey: string, number: number) {
    await expect(
      this.tableRows
        .filter({ has: this.page.locator(`td:has-text("${serviceKey}")`) })
        .filter({ has: this.page.locator(`td:has-text("${number}")`) })
    ).toHaveCount(0);
  }
}
