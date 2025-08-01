// src/page-objects/service-management.page.ts
import { Locator, Page } from "@playwright/test";

export class ServiceManagementPage {
  readonly page: Page;
  readonly serviceManagementHeader: Locator;
  readonly addServiceButton: Locator;
  readonly tableRows: Locator;
  readonly rowKey: (i: number) => Locator;
  readonly rowLabel: (i: number) => Locator;
  readonly rowActiveCheckbox: (i: number) => Locator;
  readonly rowMaxNumber: (i: number) => Locator;
  readonly editButton: (i: number) => Locator;
  readonly deleteButton: (i: number) => Locator;
  readonly setMaxNumberButton: (i: number) => Locator;

  // Add modal
  readonly addModal: Locator;
  readonly addKeyInput: Locator;
  readonly addLabelInput: Locator;
  readonly addMaxInput: Locator;
  readonly addActiveCheckbox: Locator;
  readonly addButtonSave: Locator;
  readonly addButtonCancel: Locator;

  // Edit modal
  readonly editModal: Locator;
  readonly editKeyInput: Locator;
  readonly editLabelInput: Locator;
  readonly editMaxInput: Locator;
  readonly editActiveCheckbox: Locator;
  readonly editButtonSave: Locator;
  readonly editButtonCancel: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page elements
    this.serviceManagementHeader = page.getByRole("heading", {
      name: "Service Management",
    });
    this.addServiceButton = page.getByRole("button", { name: "+ New Service" });
    this.tableRows = page.locator("table.table tbody tr");
    this.rowKey = (i) => this.tableRows.nth(i).locator("td").nth(0);
    this.rowLabel = (i) => this.tableRows.nth(i).locator("td").nth(1);
    this.rowActiveCheckbox = (i) =>
      this.tableRows.nth(i).locator("input.active-checkbox");
    this.rowMaxNumber = (i) => this.tableRows.nth(i).locator("td").nth(3);
    this.editButton = (i) =>
      this.tableRows.nth(i).getByRole("button", { name: "Edit" });
    this.deleteButton = (i) =>
      this.tableRows.nth(i).getByRole("button", { name: "Delete" });
    this.setMaxNumberButton = (i) =>
      this.tableRows.nth(i).getByRole("button", { name: "Set Max #" });

    // Add Modal
    this.addModal = page.locator("#add-modal");
    this.addKeyInput = this.addModal.locator("input").nth(0);
    this.addLabelInput = this.addModal.locator("input").nth(1);
    this.addMaxInput = this.addModal.locator("input[type=number]").first();
    this.addActiveCheckbox = this.addModal
      .locator("input[type=checkbox]")
      .first();
    this.addButtonSave = this.addModal.getByRole("button", { name: "Save" });
    this.addButtonCancel = this.addModal.getByRole("button", {
      name: "Cancel",
    });

    // Edit Modal
    this.editModal = page.locator("#edit-modal");
    this.editKeyInput = this.editModal.locator("input").nth(0);
    this.editLabelInput = this.editModal.locator("input").nth(1);
    this.editMaxInput = this.editModal.locator("input[type=number]").first();
    this.editActiveCheckbox = this.editModal
      .locator("input[type=checkbox]")
      .first();
    this.editButtonSave = this.editModal.getByRole("button", { name: "Save" });
    this.editButtonCancel = this.editModal.getByRole("button", {
      name: "Cancel",
    });
  }

  async navigate() {
    await this.page.goto("/admin/services");
  }

  async countRows() {
    return this.tableRows.count();
  }

  // Add flow
  async clickAddService() {
    await this.addServiceButton.click();
    await this.addModal.waitFor({ state: "visible" });
  }
  async fillAddService(data: {
    key: string;
    label: string;
    max: number;
    active: boolean;
  }) {
    await this.addKeyInput.fill(data.key);
    await this.addLabelInput.fill(data.label);
    await this.addMaxInput.fill(data.max.toString());
    if (data.active !== (await this.addActiveCheckbox.isChecked())) {
      await this.addActiveCheckbox.click();
    }
  }
  async saveAddService() {
    await this.addButtonSave.click();
    await this.addModal.waitFor({ state: "hidden" });
  }
  async cancelAddService() {
    await this.addButtonCancel.click();
    await this.addModal.waitFor({ state: "hidden" });
  }

  // Edit flow
  async clickEditService(index: number) {
    await this.editButton(index).click();
    await this.editModal.waitFor({ state: "visible" });
  }
  async fillEditService(data: {
    label?: string;
    max?: number;
    active?: boolean;
  }) {
    if (data.label !== undefined) {
      await this.editLabelInput.fill(data.label);
    }
    if (data.max !== undefined) {
      await this.editMaxInput.fill(data.max.toString());
    }
    if (
      data.active !== undefined &&
      data.active !== (await this.editActiveCheckbox.isChecked())
    ) {
      await this.editActiveCheckbox.click();
    }
  }
  async saveEditService() {
    await this.editButtonSave.click();
    await this.editModal.waitFor({ state: "hidden" });
  }
  async cancelEditService() {
    await this.editButtonCancel.click();
    await this.editModal.waitFor({ state: "hidden" });
  }

  // Other actions
  async toggleActive(index: number) {
    await this.rowActiveCheckbox(index).click();
  }
  async deleteService(index: number) {
    await this.deleteButton(index).click();
    await this.page.waitForEvent("dialog").then((dialog) => dialog.accept());
  }
  async setMaxNumber(index: number, value: number) {
    await this.setMaxNumberButton(index).click();
    await this.page
      .waitForEvent("dialog")
      .then((dialog) => dialog.accept(value.toString()));
  }
}
