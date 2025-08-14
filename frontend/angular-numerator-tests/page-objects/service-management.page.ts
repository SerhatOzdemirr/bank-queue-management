import { Page, Locator, expect } from "@playwright/test";

export class ServiceManagementPage {
  readonly page: Page;

  readonly header: Locator;
  readonly newServiceBtn: Locator;
  readonly serviceRows: Locator;

  // Add Modal
  readonly addKeyInput: Locator;
  readonly addLabelInput: Locator;
  readonly addMaxInput: Locator;
  readonly addPriorityInput: Locator;
  readonly addActiveCheckbox: Locator;
  readonly addSaveBtn: Locator;
  readonly addCancelBtn: Locator;

  // Edit Modal
  readonly editKeyInput: Locator;
  readonly editLabelInput: Locator;
  readonly editMaxInput: Locator;
  readonly editPriorityInput: Locator;
  readonly editActiveCheckbox: Locator;
  readonly editSaveBtn: Locator;
  readonly editCancelBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.header = page.getByRole("heading", { name: "Service Management" });
    this.newServiceBtn = page.getByRole("button", { name: "+ New Service" });
    this.serviceRows = page.locator("tbody tr");

    this.addKeyInput = page.locator(".modal input").nth(0);
    this.addLabelInput = page.locator(".modal input").nth(1);
    this.addMaxInput = page.locator(".modal input").nth(2);
    this.addPriorityInput = page.locator(".modal input").nth(3);
    this.addActiveCheckbox = page.locator(".modal input[type='checkbox']");
    this.addSaveBtn = page.locator(".modal button", { hasText: "Save" });
    this.addCancelBtn = page.locator(".modal button", {
      hasText: "Cancel",
    });

    // Edit Modal
    this.editKeyInput = page.locator("#edit-modal input").nth(0);
    this.editLabelInput = page.locator("#edit-modal input").nth(1);
    this.editMaxInput = page.locator("#edit-modal input").nth(2);
    this.editPriorityInput = page.locator("#edit-modal input").nth(3);
    this.editActiveCheckbox = page.locator(
      "#edit-modal input[type='checkbox']"
    );
    this.editSaveBtn = page.locator("#edit-modal button", { hasText: "Save" });
    this.editCancelBtn = page.locator("#edit-modal button", {
      hasText: "Cancel",
    });
  }
  async gotoServiceManagementPage(baseUrl) {
    await this.page.goto(`${baseUrl}/admin/services`);
  }
  async openAddServiceModal() {
    await this.newServiceBtn.click();
  }
  async fillAddForm(
    addKey: string,
    addLabel: string,
    addMaxNumber: number,
    addPriority: number,
    addActive: boolean
  ) {
    await this.addKeyInput.fill(addKey);
    await this.addLabelInput.fill(addLabel);
    await this.addMaxInput.fill(addMaxNumber.toString());
    await this.addPriorityInput.fill(addPriority.toString());
    if (addActive) {
      await this.addActiveCheckbox.check();
    } else {
      await this.addActiveCheckbox.uncheck();
    }
  }
  async saveAdd() {
    await this.addSaveBtn.click();
  }
  async cancelAdd() {
    await this.addCancelBtn.click();
  }
  async openEditModal(rowIndex: number) {
    await this.serviceRows
      .nth(rowIndex)
      .getByRole("button", { name: "Edit" })
      .click();
  }
  async fillEditForm(
    editKey: string,
    editLabel: string,
    editMaxNumber: number,
    editPriority: number,
    editActive: boolean
  ) {
    await this.editKeyInput.fill(editKey);
    await this.editLabelInput.fill(editLabel);
    await this.editMaxInput.fill(editMaxNumber.toString());
    await this.editPriorityInput.fill(editPriority.toString());
    if (editActive) {
      await this.addActiveCheckbox.check();
    } else {
      await this.addActiveCheckbox.uncheck();
    }
  }
  async saveEdit() {
    await this.editSaveBtn.click();
  }
  async cancelEdit() {
    await this.editCancelBtn.click();
  }
  async toggleActive(rowIndex: number) {
    await this.serviceRows.nth(rowIndex).locator(".active-checkbox").click();
  }
  async deleteService(rowIndex: number) {
    const label = await this.serviceRows
      .nth(rowIndex)
      .locator("td")
      .nth(1)
      .innerText();

    this.page.once("dialog", async (dialog) => {
      console.log(dialog.message()); // "Delete service 'a_new'?"
      await dialog.accept(); // OK
    });

    await this.serviceRows
      .nth(rowIndex)
      .getByRole("button", { name: "Delete" })
      .click();
    await expect(
      this.page.locator("tbody tr td", { hasText: label })
    ).toHaveCount(0);
  }

  async expectServiceExists(label: string) {
    await expect(
      this.page.locator("tbody tr td", { hasText: label })
    ).toBeVisible();
  }
  async expectServiceNotExists(label: string) {
    await expect(
      this.page.locator("tbody tr td", { hasText: label })
    ).toHaveCount(0);
  }
}
