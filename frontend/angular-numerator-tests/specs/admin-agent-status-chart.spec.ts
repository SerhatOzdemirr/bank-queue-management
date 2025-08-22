import { test, expect } from "@playwright/test";
import { AdminAgentStatusPage } from "../page-objects/admin-agent-status-chart";
import {
  ensureLoggedInAdminForServiceManagement,
  ensureLoggedInDefault,
} from "../utils/auth";

const FRONT_URL = "http://localhost:4200";

test.describe.serial("Admin Agent Status Chart (POM + Mocked API)", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedInAdminForServiceManagement(page);
    page.route("**/api/**/admin/stats/agent-activity**", async (route) => {
      const url = new URL(route.request().url());
      expect(url.searchParams.get("range")).toBe("7d");

      const body = [
        {
          agentId: 1,
          agentName: "Ada",
          pending: 2,
          accepted: 5,
          rejected: 1,
          total: 8,
          recentTickets: [],
        },
        {
          agentId: 2,
          agentName: "Bob",
          pending: 1,
          accepted: 1,
          rejected: 0,
          total: 2,
          recentTickets: [],
        },
      ];

      await route.fulfill({
        status: 200,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify(body),
      });
    });
  });

  test("Chart render olur ve canvas boyutları > 0", async ({ page }) => {
    const admin = new AdminAgentStatusPage(page);

    await admin.goto(FRONT_URL, "/admin");
    await admin.waitForChartRendered();

    const { width, height } = await admin.getCanvasSize();
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });
});
