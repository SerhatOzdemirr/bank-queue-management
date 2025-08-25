import { Page, Locator, expect } from "@playwright/test";

export class AdminUsersPage {
  readonly page: Page;

  readonly loading: Locator;
  readonly error: Locator;
  readonly table: Locator;
  readonly tbody: Locator;
  readonly rows: Locator;
  readonly noRecords: Locator;

  constructor(page: Page) {
    this.page = page;

    this.loading = page.locator("text=Loading...");
    this.error = page.locator(".text-danger");
    this.table = page.locator("table.table");
    this.tbody = this.table.locator("tbody");
    this.rows = this.tbody.locator("tr");
    this.noRecords = page.locator("text=Kayıt bulunamadı.");
  }



  // ---------- Row helpers ----------
  rowByIndex(i: number): Locator {
    return this.rows.nth(i);
  }

  rowByEmail(email: string): Locator {
    // exact eşleşme için getByText kullan
    return this.rows.filter({
      has: this.page.getByText(email, { exact: true }),
    });
  }

  private idCell(row: Locator) {
    return row.locator("td").nth(0);
  }
  private usernameCell(row: Locator) {
    return row.locator("td").nth(1);
  }
  private emailCell(row: Locator) {
    return row.locator("td").nth(2);
  }
  private priorityInput(row: Locator) {
    return row.locator("td").nth(3).locator('input[type="number"]');
  }
  private roleCell(row: Locator) {
    return row.locator("td").nth(4);
  }
  private saveButton(row: Locator) {
    return row.locator("td").nth(5).getByRole("button", { name: /save/i });
  }

  // ---------- Actions ----------
  async setPriority(row: Locator, value: number) {
    const input = this.priorityInput(row);
    await input.fill(""); // temizle
    await input.fill(String(value)); // yeni değer
  }

  async save(row: Locator) {
    await this.saveButton(row).click();
  }

  async setPriorityByEmail(email: string, value: number) {
    const row = this.rowByEmail(email).first();
    await expect(row).toBeVisible();
    await this.setPriority(row, value);
  }

  async saveByEmail(email: string) {
    const row = this.rowByEmail(email).first();
    await expect(row).toBeVisible();
    await this.save(row);
  }

  // ---------- Reads ----------
  async rowCount(): Promise<number> {
    return this.rows.count();
  }

  async readRow(row: Locator) {
    const idTxt = (await this.idCell(row).textContent()) ?? "0";
    const username = (await this.usernameCell(row).textContent())?.trim() ?? "";
    const email = (await this.emailCell(row).textContent())?.trim() ?? "";
    const priorityTxt = await this.priorityInput(row).inputValue();
    const role = (await this.roleCell(row).textContent())?.trim() ?? "";

    return {
      id: Number.parseInt(idTxt, 10),
      username,
      email,
      priority: Number.parseInt(priorityTxt, 10),
      role,
    };
  }

  async readByEmail(email: string) {
    const row = this.rowByEmail(email).first();
    await expect(row).toBeVisible();
    return this.readRow(row);
  }
}
