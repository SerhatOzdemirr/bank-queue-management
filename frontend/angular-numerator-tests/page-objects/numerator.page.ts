import { Page, Locator, expect } from "@playwright/test";

export class NumeratorPage {
  readonly page: Page;

  readonly serviceCards: Locator;
  readonly stepItems: Locator;

  readonly takeNumberButton: Locator;
  readonly backButton: Locator;
  readonly newOperationButton: Locator;
  readonly cancelButton: Locator;

  readonly resultContainer: Locator;
  readonly takenNumber: Locator;
  readonly serviceLabel: Locator;
  readonly takenAt: Locator;
  readonly assignedAgent: Locator;
  readonly assignedAt: Locator;
  readonly assignmentStatus: Locator;

  readonly pagerPrev: Locator;
  readonly pagerNext: Locator;
  readonly pagerButtons: Locator;

  constructor(page: Page) {
    this.page = page;

    this.serviceCards = page.locator(".service-card");
    this.stepItems = page.locator(".stepper .step-item");

    this.takeNumberButton = page.getByRole("button", {
      name: "Take the Number",
    });
    this.backButton = page.getByRole("button", { name: "Back" });
    this.newOperationButton = page.getByRole("button", {
      name: "New Operation",
    });
    this.cancelButton = page.getByRole("button", { name: "Cancel Ticket" });

    this.resultContainer = page.locator(".result");
    this.takenNumber = page.locator(".taken-number");
    this.serviceLabel = page
      .locator(".result p")
      .filter({ hasText: "Service:" });
    this.takenAt = page.locator(".result p").filter({ hasText: "Taken At:" });
    this.assignedAgent = page
      .locator(".result p")
      .filter({ hasText: "Assigned Agent:" });
    this.assignedAt = page
      .locator(".result p")
      .filter({ hasText: "Assigned At:" });
    this.assignmentStatus = page
      .locator(".result p")
      .filter({ hasText: "Status:" });

    this.pagerPrev = page.getByRole("button", { name: "‹ Prev" });
    this.pagerNext = page.getByRole("button", { name: "Next ›" });
    this.pagerButtons = page.locator(
      ".pager button:not(:has-text('Prev')):not(:has-text('Next'))"
    );
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/numerator`);
    await expect(this.stepItems.first()).toBeVisible();
  }

  async selectService(label: string) {
    await this.cardByLabel(label).click();
  }

  async clickTakeNumber() {
    await this.takeNumberButton.click();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async clickNewOperation() {
    await this.newOperationButton.click();
  }

  async clickCancelTicket() {
    await this.cancelButton.click();
  }

  async activeSteps(): Promise<string[]> {
    return this.page.locator(".stepper .step-item.active").allInnerTexts();
  }

  async expectResultVisible() {
    await expect(this.resultContainer).toBeVisible();
  }

  async readTakenNumber(): Promise<number> {
    return Number(await this.takenNumber.innerText());
  }

  async readServiceText() {
    return (await this.serviceLabel.innerText()).replace(/\s+/g, " ").trim();
  }

  cardByLabel(label: string): Locator {
    return this.serviceCards.filter({
      has: this.page.getByRole("heading", { name: label }),
    });
  }

  async expectCardDisabled(label: string) {
    await expect(this.cardByLabel(label)).toHaveClass(/disabled/);
  }

  async visibleCardTitles(): Promise<string[]> {
    return this.page.locator(".card-grid .service-card h3").allInnerTexts();
  }
}
