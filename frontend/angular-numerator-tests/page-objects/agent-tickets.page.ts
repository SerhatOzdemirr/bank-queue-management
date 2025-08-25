import { Page, Locator, expect } from "@playwright/test";

export class AgentTicketsPage {
  readonly page: Page;

  readonly loading: Locator;
  readonly error: Locator;
  readonly agentDiv: Locator;
  readonly table: Locator;
  readonly rows: Locator;
  readonly noTickets: Locator;

  readonly modal: Locator;
  readonly modalCandidates: Locator;
  readonly modalClose: Locator;

  constructor(page: Page) {
    this.page = page;

    this.loading = page.locator("text=Loading…");
    this.error = page.locator(".error");
    this.agentDiv = page.locator(".agent-div");
    this.table = page.locator("table.table-agent-tickets");
    this.rows = this.table.locator("tbody tr");
    this.noTickets = page.locator("text=You have no pending assignments.");

    this.modal = page.locator(".modal-overlay");
    this.modalCandidates = this.modal.locator(".candidate-list button");
    this.modalClose = this.modal.locator(".close-btn");
  }

  // Navigation
  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/agent/tickets`);
    await this.page.waitForURL("**/agent/tickets");
  }

  async waitForLoaded() {
    await Promise.race([
      this.table.waitFor({ state: "visible" }),
      this.noTickets.waitFor({ state: "visible" }),
    ]);
  }

  // Helpers for row selection
  rowByIndex(i: number): Locator {
    return this.rows.nth(i);
  }

  rowByNumber(ticketNumber: number): Locator {
    return this.rows.filter({ hasText: `${ticketNumber}` });
  }

  private acceptBtn(row: Locator) {
    return row.locator("button.accept-btn");
  }
  private rejectBtn(row: Locator) {
    return row.locator("button.reject-btn");
  }
  private routeBtn(row: Locator) {
    return row.locator("button.route-btn");
  }

  // Actions
  async acceptTicket(row: Locator) {
    await this.acceptBtn(row).click();
  }

  async rejectTicket(row: Locator) {
    await this.rejectBtn(row).click();
  }

  async openRouting(row: Locator) {
    await this.routeBtn(row).click();
    
  }

  async routeToCandidate(candidateIndex: number) {
    await this.modalCandidates.nth(candidateIndex).click();
  }

  async closeModal() {
    await this.modalClose.click();
    await expect(this.modal).toBeHidden();
  }

  // Reads
  async readRow(row: Locator) {
    const cells = row.locator("td");
    const number = (await cells.nth(0).textContent())?.trim() ?? "";
    const priority = (await cells.nth(1).textContent())?.trim() ?? "";
    const service = (await cells.nth(2).textContent())?.trim() ?? "";
    const takenAt = (await cells.nth(3).textContent())?.trim() ?? "";
    const assignedAt = (await cells.nth(4).textContent())?.trim() ?? "";
    const status = (await cells.nth(5).textContent())?.trim() ?? "";
    const user = (await cells.nth(6).textContent())?.trim() ?? "";

    return {
      number,
      priority,
      service,
      takenAt,
      assignedAt,
      status,
      user,
    };
  }
}
