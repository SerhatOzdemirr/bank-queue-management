// tests/specs/profile.statistics.spec.ts
import { test, expect, Page } from "@playwright/test";
import { ProfileStatisticsPage } from "../page-objects/profile-statistics.page";
import { ensureLoggedInDefault } from "../utils/auth";

const BASE_URL = "http://localhost:4200";

type Stats = {
  totalTickets: number;
  approved: number;
  rejected: number;
  pending: number;
};
type HistoryRow = {
  service: string;
  number: number;
  status: "approved" | "rejected" | "pending";
  takenAt: string;
};
type Profile = {
  id: number;
  username: string;
  email: string;
  role: string;
  avatarUrl: string;
};

async function setupProfileStatsMocks(page: Page) {
  // 🔒 1) Global yazma kilidi: POST/PUT/PATCH/DELETE -> 405
  await page.route("**/api/**", async (route) => {
    const m = route.request().method();
    if (m === "GET" || m === "HEAD" || m === "OPTIONS") return route.continue();
    await route.fulfill({ status: 405, body: "Writes disabled in tests" });
  });

  // 2) In-memory state (GET'ler bundan beslenecek)
  const state: {
    profile: Profile;
    stats: Stats;
    history: HistoryRow[];
  } = {
    profile: {
      id: 7,
      username: "Test Default",
      email: "testdefault@mail.com",
      role: "Default",
      avatarUrl: "http://localhost:5034/media/avatars/u1.png",
    },
    stats: { totalTickets: 3, approved: 2, rejected: 0, pending: 1 },
    history: [
      {
        service: "ACC",
        number: 101,
        status: "approved",
        takenAt: "2025-08-01T10:00:00Z",
      },
      {
        service: "SUP",
        number: 102,
        status: "pending",
        takenAt: "2025-08-02T11:00:00Z",
      },
      {
        service: "LOAN",
        number: 201,
        status: "approved",
        takenAt: "2025-08-03T12:00:00Z",
      },
    ],
  };

  // 3) Profile GET (eğer header/info çekiliyorsa)
  await page.route("**/api/profile", async (route) => {
    await route.fulfill({ json: state.profile });
  });

  // 4) Statistics GET
  await page.route("**/api/profile/statistics", async (route) => {
    await route.fulfill({ json: state.stats });
  });

  // 5) Ticket history GET
  await page.route("**/api/profile/ticket-history", async (route) => {
    await route.fulfill({ json: state.history });
  });

  // (Opsiyonel) auth/me GET — tamamen offline kalmak istersen:
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      json: { id: 7, email: state.profile.email, role: "User" },
    });
  });

  return state;
}

test.describe
  .serial("Profile › Statistics & History (real auth + fully mocked, NO DB writes)", () => {
  let statsPage: ProfileStatisticsPage;
  let stateRef: Awaited<ReturnType<typeof setupProfileStatsMocks>>;

  test.beforeEach(async ({ page }) => {
    stateRef = await setupProfileStatsMocks(page);
    await ensureLoggedInDefault(page); 
    statsPage = new ProfileStatisticsPage(page);
    await statsPage.navigateTo(BASE_URL);
    await statsPage.waitForLoaded();
  });

  test("renders stats and history correctly", async () => {
    const stats = await statsPage.readStats();
    expect(stats).toEqual(stateRef.stats);

    const rows = await statsPage.rowCount();
    expect(rows).toBe(stateRef.history.length);

    // İlk satır detayı (temel doğrulama)
    const r0 = await statsPage.getRow(0);
    expect(r0.service).toBe(stateRef.history[0].service);
    expect(r0.number).toBe(String(stateRef.history[0].number));
    expect(r0.statusText.toLowerCase()).toContain(stateRef.history[0].status); // "approved"/"pending"/"rejected"
  });

  test("empty history shows zero stats and no-history message", async ({
    page,
  }) => {
    stateRef.history.length = 0;
    stateRef.stats = { totalTickets: 0, approved: 0, rejected: 0, pending: 0 };

    await page.reload();
    await statsPage.waitForLoaded();

    const stats = await statsPage.readStats();
    expect(stats).toEqual({ totalTickets: 0, approved: 0, rejected: 0, pending: 0 });

    expect(await statsPage.rowCount()).toBe(0);
    expect(await statsPage.isNoHistoryVisible()).toBe(true);
  });

  test("blocks any write attempts under /api", async ({
    page,
  }) => {
    const resp = await page.evaluate(async () => {
      const r = await fetch("/api/profile/avatar", { method: "POST" });
      return { ok: r.ok, status: r.status };
    });
    expect(resp.ok).toBe(false);
    expect(resp.status).toBe(405);
  });
});
