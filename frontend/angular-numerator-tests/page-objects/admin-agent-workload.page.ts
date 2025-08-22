import { Page, Locator, expect } from "@playwright/test";

export class AdminAgentWorkloadPage {
  readonly page: Page;
  readonly chartHost: Locator;
  readonly chartCanvas: Locator;

  constructor(page: Page) {
    this.page = page;
    this.chartHost = page.locator("app-admin-agent-workload-chart");
    this.chartCanvas = this.chartHost.locator("canvas");
  }

  async goto(baseUrl: string, path = "/admin") {
    await this.page.goto(`${baseUrl}${path}`);
    await expect(this.chartHost).toBeVisible();
  }

  async waitForChartRendered() {
    await expect(this.chartCanvas).toBeVisible();
    await this.page.waitForFunction((sel) => {
      const c = document.querySelector<HTMLCanvasElement>(sel);
      return !!c && c.width > 0 && c.height > 0;
    }, "app-admin-agent-workload-chart canvas");
  }

  async getCanvasSize() {
    return this.chartCanvas.evaluate((el: HTMLCanvasElement) => ({
      width: el.width,
      height: el.height,
    }));
  }
}
