import { Page, Locator, expect } from "@playwright/test";

export class ServiceManagementPage {
  readonly page: Page;

  readonly header: Locator;
  readonly newServiceBtn: Locator;
  readonly rows: Locator;

  // Add Modal
  readonly addModal: Locator;
  readonly addKeyInput: Locator;
  readonly addLabelInput: Locator;
  readonly addMaxInput: Locator;
  readonly addPriorityInput: Locator;
  readonly addActiveCheckbox: Locator;
  readonly addSaveBtn: Locator;
  readonly addCancelBtn: Locator;

  // Edit Modal
  readonly editModal: Locator;
  readonly editKeyInput: Locator;
  readonly editLabelInput: Locator;
  readonly editMaxInput: Locator;
  readonly editPriorityInput: Locator;
  readonly editActiveCheckbox: Locator;
  readonly editSaveBtn: Locator;
  readonly editCancelBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.header = page.getByRole("link", { name: "Service Management" });
    this.newServiceBtn = page.getByRole("button", { name: "+ New Service" });
    this.rows = page.locator("tbody tr");

    // Add modal (scoped to #add-modal)
    this.addModal = page.locator("#add-modal");
    this.addKeyInput = this.addModal.locator("input").nth(0);
    this.addLabelInput = this.addModal.locator("input").nth(1);
    this.addMaxInput = this.addModal.locator('input[type="number"]').nth(0);
    this.addPriorityInput = this.addModal
      .locator('input[type="number"]')
      .nth(1);
    this.addActiveCheckbox = this.addModal.locator('input[type="checkbox"]');
    this.addSaveBtn = this.addModal.getByRole("button", { name: "Save" });
    this.addCancelBtn = this.addModal.getByRole("button", { name: "Cancel" });

    // Edit modal (scoped to #edit-modal)
    this.editModal = page.locator("#edit-modal");
    this.editKeyInput = this.editModal.locator("input").nth(0);
    this.editLabelInput = this.editModal.locator("input").nth(1);
    this.editMaxInput = this.editModal.locator('input[type="number"]').nth(0);
    this.editPriorityInput = this.editModal
      .locator('input[type="number"]')
      .nth(1);
    this.editActiveCheckbox = this.editModal.locator('input[type="checkbox"]');
    this.editSaveBtn = this.editModal.getByRole("button", { name: "Save" });
    this.editCancelBtn = this.editModal.getByRole("button", { name: "Cancel" });
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/admin/services`);
    await expect(this.header).toBeVisible();
    await this.header.click();
  }

  /* ---------- Row helpers ---------- */

  rowByLabel(label: string): Locator {
    // 2. sütun (Label + badge) üzerinde label'i arar
    return this.page.locator("tbody tr").filter({
      has: this.page.locator("td:nth-child(2)", { hasText: label }),
    });
  }

  activeCheckboxInRow(row: Locator): Locator {
    return row.locator(".active-checkbox");
  }

  priorityBadgeInRow(row: Locator): Locator {
    return row.locator("td:nth-child(2) .prio-badge");
  }

  async expectServiceVisible(label: string) {
    await expect(this.rowByLabel(label)).toHaveCount(1);
  }

  async expectServiceNotVisible(label: string) {
    await expect(this.rowByLabel(label)).toHaveCount(0);
  }

  async expectPriorityBadge(label: string, badge: string) {
    await expect(this.priorityBadgeInRow(this.rowByLabel(label))).toHaveText(
      badge
    );
  }

  async expectActive(label: string, isChecked: boolean) {
    const cb = this.activeCheckboxInRow(this.rowByLabel(label));
    await expect(cb).toBeChecked({ checked: isChecked });
  }

  /* ---------- Add ---------- */

  async openAddModal() {
    await this.newServiceBtn.click();
    await expect(this.addModal).toBeVisible();
  }

  async fillAddForm(
    key: string,
    label: string,
    maxNum: number,
    priority: number,
    active: boolean
  ) {
    await this.addKeyInput.fill(key);
    await this.addLabelInput.fill(label);
    await this.addMaxInput.fill(String(maxNum));
    await this.addPriorityInput.fill(String(priority));
    if (active) await this.addActiveCheckbox.check();
    else await this.addActiveCheckbox.uncheck();
  }

  async saveAdd() {
    await this.addSaveBtn.click();
    await expect(this.addModal).toBeHidden();
  }

  /* ---------- Edit ---------- */

  async openEditModalByLabel(label: string) {
    const row = this.rowByLabel(label);
    await row.getByRole("button", { name: "Edit" }).click();
    await expect(this.editModal).toBeVisible();
  }

  async fillEditForm(
    key: string,
    label: string,
    maxNum: number,
    priority: number,
    active: boolean
  ) {
    await this.editKeyInput.fill(key);
    await this.editLabelInput.fill(label);
    await this.editMaxInput.fill(String(maxNum));
    await this.editPriorityInput.fill(String(priority));
    if (active) await this.editActiveCheckbox.check();
    else await this.editActiveCheckbox.uncheck();
  }

  async saveEdit() {
    await this.editSaveBtn.click();
    await expect(this.editModal).toBeHidden();
  }

  /* ---------- Toggle Active ---------- */

  async toggleActive(label: string) {
    await this.activeCheckboxInRow(this.rowByLabel(label)).click();
  }

  /* ---------- Delete ---------- */

  async deleteByLabel(label: string) {
    const row = this.rowByLabel(label);

    this.page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    await row.getByRole("button", { name: "Delete" }).click();
    await this.expectServiceNotVisible(label);
  }
}
