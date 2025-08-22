import { Page, Locator, expect } from "@playwright/test";

export class AdminTicketsByServicePage {
  readonly page: Page;
  readonly canvas: Locator;
  readonly rangeSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.canvas = page.locator("#ticketsByService");
    this.rangeSelect = page.locator(".toolbar select");
  }

  async goto(baseUrl: string, path = "/admin/dashboard") {
    await this.page.goto(`${baseUrl}${path}`);
    await expect(this.rangeSelect).toBeVisible();
  }

  async waitForChartRendered() {
    await expect(this.canvas).toBeVisible();
    await this.page.waitForFunction((sel) => {
      const c = document.querySelector<HTMLCanvasElement>(sel);
      return !!c && c.width > 0 && c.height > 0;
    }, "#ticketsByService");
  }

  async selectRange(value: "today" | "7d" | "30d") {
    await this.rangeSelect.selectOption(value);
  }

  async selectedRange() {
    return this.rangeSelect.inputValue();
  }

  async getCanvasSize() {
    return this.canvas.evaluate((el: HTMLCanvasElement) => ({
      width: el.width,
      height: el.height,
    }));
  }
}
