import { Page, Locator } from "@playwright/test";

export class NumeratorPage {
  readonly page: Page;
  readonly serviceCards: Locator;
  readonly takeNumberButton: Locator;
  readonly backButton: Locator;
  readonly resultContainer: Locator;
  readonly takenNumber: Locator;
  readonly serviceLabel: Locator;
  readonly takenAt: Locator;
  readonly stepItems: Locator;
  readonly newOperationButton: Locator;
  constructor(page: Page) {
    this.page = page;
    this.serviceCards = this.page.locator(".service-card");
    this.takeNumberButton = this.page.getByRole("button", {
      name: "Take the Number",
    });
    this.backButton = this.page.getByRole("button", { name: "Back" });
    this.resultContainer = this.page.locator(".result");
    this.takenNumber = this.page.locator(".taken-number");
    this.serviceLabel = page.locator(".result p").first();
    this.takenAt = page.locator(".result p").nth(1);
    this.stepItems = page.locator(".stepper .step-item");
    this.newOperationButton = page.getByRole("button", {
      name: "New Operation",
    });
  }

  async navigate(baseUrl: string) {
    await this.page.goto(`${baseUrl}/numerator`);
  }

  async selectService(label: string) {
    await this.serviceCards.getByText(label).click();
  }

  async clickTakeNumber() {
    await this.takeNumberButton.click();
  }

  private async _normalize(inner: Promise<string>) {
    const t = await inner;
    return t
      .replace(/[·\n\r]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  async getResultText() {
    return this._normalize(this.resultContainer.innerText());
  }

  async getTakenNumber() {
    return this.takenNumber.innerText();
  }

  async getServiceLabel() {
    return this.serviceLabel.innerText();
  }

  async getTakenAt() {
    return this.takenAt.innerText();
  }

  async getActiveStepLabels(): Promise<string[]> {
    return this.page.locator(".stepper .step-item.active").allInnerTexts();
  }
}
