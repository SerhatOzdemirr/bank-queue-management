import { Page, Locator } from "@playwright/test";

export class ProfileStatisticsPage {
  readonly page: Page;

  // Headings
  readonly statsHeading: Locator;
  readonly historyHeading: Locator;

  // Stat cards
  readonly totalVal: Locator;
  readonly approvedVal: Locator;
  readonly rejectedVal: Locator;
  readonly pendingVal: Locator;

  // History table
  readonly tableRows: Locator;
  readonly noHistoryMsg: Locator;

  constructor(page: Page) {
    this.page = page;
    // Headings
    this.statsHeading = page.getByRole("heading", {
      name: "Ticket Statistics",
    });
    this.historyHeading = page.getByRole("heading", { name: "Ticket History" });

    // Stat values
    this.totalVal = page.locator(".stat-total p");
    this.approvedVal = page.locator(".stat-approved p");
    this.rejectedVal = page.locator(".stat-rejected p");
    this.pendingVal = page.locator(".stat-pending p");

    // History
    this.tableRows = page.locator("tbody tr");
    this.noHistoryMsg = page.locator(".no-history-msg");
  }
  async navigateTo(baseurl: string): Promise<void> {
    await this.page.goto(`${baseurl}/profile`);
  }

  async waitForLoaded(): Promise<void> {
    await this.statsHeading.waitFor();
    await this.historyHeading.waitFor();
  }

  async readStats(): Promise<{
    total: number;
    approved: number;
    rejected: number;
    pending: number;
  }> {
    const [total, approved, rejected, pending] = await Promise.all([
      this.totalVal.textContent(),
      this.approvedVal.textContent(),
      this.rejectedVal.textContent(),
      this.pendingVal.textContent(),
    ]);
    return {
      total: Number((total ?? "").trim()),
      approved: Number((approved ?? "").trim()),
      rejected: Number((rejected ?? "").trim()),
      pending: Number((pending ?? "").trim()),
    };
  }

  async rowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async getRow(
    index: number
  ): Promise<{
    service: string;
    number: string;
    statusText: string;
    statusClass: string;
    takenAt: string;
  }> {
    const row = this.tableRows.nth(index);
    const service =
      (await row.locator("td").nth(0).textContent())?.trim() || "";
    const number = (await row.locator("td").nth(1).textContent())?.trim() || "";
    const statusEl = row.locator("td.status");
    const statusText = (await statusEl.textContent())?.trim() || "";
    const statusClass = (await statusEl.getAttribute("class")) || "";
    const takenAt =
      (await row.locator("td").nth(3).textContent())?.trim() || "";
    return { service, number, statusText, statusClass, takenAt };
  }

  async isNoHistoryVisible(): Promise<boolean> {
    return await this.noHistoryMsg.isVisible();
  }
}
