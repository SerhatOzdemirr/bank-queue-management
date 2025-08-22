import { test, expect } from "@playwright/test";
import { ensureLoggedInAdminForServiceManagement } from "../utils/auth";
import { AdminAgentWorkloadPage } from "../page-objects/admin-agent-workload.page";

const FRONT_URL = "http://localhost:4200";
const PAGE_PATH = "/admin/dashboard";

test.describe.serial("Admin Agent Workload Chart (POM + Mocked API)", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedInAdminForServiceManagement(page);

    page.route(/.*\/api\/.*/i, async (route) => {
      if (route.request().method() === "OPTIONS") {
        return route.fulfill({
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      }
      return route.fallback();
    });

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
          accepted: 3,
          rejected: 0,
          total: 4,
          recentTickets: [],
        },
        {
          agentId: 3,
          agentName: "Cem",
          pending: 0,
          accepted: 2,
          rejected: 2,
          total: 4,
          recentTickets: [],
        },
      ];

      await route.fulfill({
        status: 200,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify(body),
      });
    });

    page.route(/.*\/api\/.*/i, async (route) => {
      return route.fulfill({
        status: 501,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Unexpected API call",
          url: route.request().url(),
        }),
      });
    });
  });

  test("Chart renders and canvas size > 0", async ({ page }) => {
    const admin = new AdminAgentWorkloadPage(page);
    await admin.goto(FRONT_URL, PAGE_PATH);
    await admin.waitForChartRendered();
    const { width, height } = await admin.getCanvasSize();
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test("Request params are correct (range=7d) and chart can re-render", async ({
    page,
  }) => {
    const admin = new AdminAgentWorkloadPage(page);
    await admin.goto(FRONT_URL, PAGE_PATH);
    await admin.waitForChartRendered();
    await admin.goto(FRONT_URL, PAGE_PATH);
    await admin.waitForChartRendered();
    const { width } = await admin.getCanvasSize();
    expect(width).toBeGreaterThan(0);
  });
});
