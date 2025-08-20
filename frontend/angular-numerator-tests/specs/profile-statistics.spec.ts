import { test, expect, Page, Route } from "@playwright/test";
import { ProfileStatisticsPage } from "../page-objects/profile-statistics.page";
import { ensureLoggedInAdmin, ensureLoggedInAgent } from "../utils/auth";

const BASE = "http://localhost:4200";

const statsFixture = {
  totalTickets: 25,
  approved: 10,
  rejected: 5,
  pending: 10,
};
const historyFixture = [
  {
    service: "Passport",
    number: 17,
    status: "Approved",
    takenAt: "2025-08-19T08:05:00Z",
  },
  {
    service: "Tax",
    number: 42,
    status: "Pending",
    takenAt: "2025-08-19T09:10:00Z",
  },
  {
    service: "Bank",
    number: 3,
    status: "Rejected",
    takenAt: "2025-08-19T10:20:00Z",
  },
];

async function mockProfileStatsApi(
  page: Page,
  {
    stats = statsFixture,
    history = historyFixture,
    delayMs = 0,
  }: { stats?: any; history?: any; delayMs?: number }
) {
  await page.route("**/api/profile/statistics", async (route: Route) => {
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(stats),
    });
  });
  await page.route("**/api/profile/ticket-history", async (route: Route) => {
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(history),
    });
  });
}

test.describe.serial("Profile Statistics (POM + Mock API + Auth)", () => {
  test.beforeEach(async ({ page }) => {
    // await ensureLoggedInAgent(page, {
    //   tokenKey: "access_token",
    // });
    await ensureLoggedInAdmin(page, {
      tokenKey: "access_token",
    });
  });

  test("istatistikler ve geçmiş doğru render edilir", async ({ page }) => {
    await mockProfileStatsApi(page, {});
    const ps = new ProfileStatisticsPage(page);

    await ps.navigateTo(BASE);
    await ps.waitForLoaded();

    const stats = await ps.readStats();
    expect(stats.total).toBe(statsFixture.totalTickets);
    expect(stats.approved).toBe(statsFixture.approved);
    expect(stats.rejected).toBe(statsFixture.rejected);
    expect(stats.pending).toBe(statsFixture.pending);

    expect(await ps.rowCount()).toBe(historyFixture.length);

    const first = await ps.getRow(0);
    expect(first.service).toBe("Passport");
    expect(first.number).toBe("17");
    expect(first.statusText).toBe("Approved");
    expect(first.statusClass).toMatch(/\bapproved\b/);
  });

  test("geçmiş boşken 'No ticket history available.' görünür", async ({
    page,
  }) => {
    await mockProfileStatsApi(page, { history: [] });
    const ps = new ProfileStatisticsPage(page);

    await ps.navigateTo(BASE);
    await ps.waitForLoaded();

    expect(await ps.isNoHistoryVisible()).toBeTruthy();
    expect(await ps.rowCount()).toBe(0);
  });

  test("yavaş backend simülasyonu (opsiyonel)", async ({ page }) => {
    await mockProfileStatsApi(page, { delayMs: 600 });
    const ps = new ProfileStatisticsPage(page);

    await ps.navigateTo(BASE);
    await ps.waitForLoaded();

    const stats = await ps.readStats();
    expect(stats.total).toBe(statsFixture.totalTickets);
  });
});
