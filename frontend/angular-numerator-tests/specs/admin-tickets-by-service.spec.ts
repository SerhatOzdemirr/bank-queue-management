import { test, expect } from "@playwright/test";
import { ensureLoggedInAdminForServiceManagement } from "../utils/auth";

const FRONT_URL = "http://localhost:4200";
const PAGE_PATH = "/admin/dashboard";

test.describe.serial("Admin Tickets By Service (POM + Mocked API)", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedInAdminForServiceManagement(page);

    (page as any)._seenRanges = [];

    page.route(/.*tickets-by-service.*/i, async (route) => {
      const url = new URL(route.request().url());
      const r = url.searchParams.get("range") ?? "7d";
      (page as any)._seenRanges.push(r);

      let body;
      if (r === "today") {
        body = [
          { serviceLabel: "Loans", count: 2 },
          { serviceLabel: "Account", count: 1 },
        ];
      } else if (r === "30d") {
        body = [
          { serviceLabel: "Loans", count: 80 },
          { serviceLabel: "Account", count: 65 },
          { serviceLabel: "VIP Desk", count: 20 },
        ];
      } else {
        body = [
          { serviceLabel: "Loans", count: 12 },
          { serviceLabel: "Account", count: 9 },
          { serviceLabel: "VIP Desk", count: 4 },
        ];
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify(body),
      });
    });
  });

  test("renders chart with initial 7d data", async ({ page }) => {
    await page.goto(FRONT_URL + PAGE_PATH);
    await page.waitForSelector("canvas#ticketsByService");

    const { width, height } = await page.evaluate(() => {
      const canvas =
        document.querySelector<HTMLCanvasElement>("#ticketsByService")!;
      return { width: canvas.width, height: canvas.height };
    });

    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test("changes range and reloads data correctly", async ({ page }) => {
    await page.goto(FRONT_URL + PAGE_PATH);

    const rangeSelect = page.locator("select:has(option[value='today'])");

    await rangeSelect.selectOption("today");
    await page.waitForTimeout(300);

    await rangeSelect.selectOption("30d");
    await page.waitForTimeout(300);

    const seen = (page as any)._seenRanges as string[];
    expect(new Set(seen)).toEqual(new Set(["7d", "today", "30d"]));
  });
});
