import { Page, Locator, expect } from "@playwright/test";

export class AdminAgentsPage {
  readonly page: Page;

  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly servicesToggle: Locator;
  readonly servicesMenu: Locator;
  readonly createBtn: Locator;
  readonly errorMsg: Locator;
  readonly successMsg: Locator;

  readonly agentsTable: Locator;
  readonly noAgentsText: Locator;

  constructor(page: Page) {
    this.page = page;

    this.usernameInput = page.getByPlaceholder("Username");
    this.emailInput = page.getByPlaceholder("Email");
    this.passwordInput = page.getByPlaceholder("Password");
    this.servicesToggle = page.locator(".dropdown-toggle.services-section");
    this.servicesMenu = page.locator(".dropdown-menu");
    this.createBtn = page.getByRole("button", { name: "Create Agent" });
    this.errorMsg = page.locator(".error");
    this.successMsg = page.locator(".success");

    this.agentsTable = page.locator("table");
    this.noAgentsText = page.getByText("No agents found.");
  }

  async goto(baseUrl: string, path = "/admin/agents") {
    await this.page.goto(`${baseUrl}${path}`);
    await expect(this.servicesToggle).toBeVisible();
  }

  async fillForm(u: string, e: string, p: string) {
    await this.usernameInput.fill(u);
    await this.emailInput.fill(e);
    await this.passwordInput.fill(p);
  }

  async openServices() {
    await this.servicesToggle.click();
    await expect(this.servicesMenu).toBeVisible();
  }

  serviceCheckboxByLabel(label: string) {
    return this.servicesMenu
      .locator("li label", { hasText: label })
      .locator("input[type=checkbox]");
  }

  async toggleService(label: string, checked = true) {
    await this.openServices();
    const cb = this.serviceCheckboxByLabel(label);
    if (checked) await cb.check();
    else await cb.uncheck();
  }

  async create() {
    await this.createBtn.click();
  }

  async expectAgentRow(
    username: string,
    email: string,
    servicesCsvContains: string[]
  ) {
    const row = this.agentsTable.locator("tbody tr").filter({
      has: this.page.locator("td", { hasText: username }),
    });
    await expect(row).toHaveCount(1);
    await expect(row.locator("td").nth(2)).toHaveText(email);
    const svcCell = row.locator("td").nth(3);
    for (const s of servicesCsvContains) {
      await expect(svcCell).toContainText(s);
    }
  }

  async agentsCount(): Promise<number> {
    return this.agentsTable.locator("tbody tr").count();
  }
}
