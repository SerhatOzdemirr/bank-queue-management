import { test, expect, Page } from "@playwright/test";
import { AdminTicketsPage } from "../page-objects/admin-tickets.page";
import { ensureLoggedInAdmin } from "../utils/auth";

const BASE_URL = "http://localhost:4200";

type Ticket = {
  serviceKey: string;
  number: number;
  user?: string;
  createdAt?: string;
};
type Service = { id: number; serviceKey: string; name: string };

async function setupAdminDataMocks(page: Page) {
  const state: { services: Service[]; tickets: Ticket[] } = {
    services: [
      { id: 1, serviceKey: "ACC", name: "Accounts" },
      { id: 2, serviceKey: "LOAN", name: "Loans" },
      { id: 3, serviceKey: "SUP", name: "Support" },
    ],
    tickets: [
      { serviceKey: "ACC", number: 101, user: "alice" },
      { serviceKey: "SUP", number: 102, user: "bob" },
      { serviceKey: "LOAN", number: 201, user: "carol" },
    ],
  };

  await page.route("**/api/admin/services", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: state.services });
      return;
    }
    await route.continue();
  });

  await page.route("**/api/admin/tickets**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());

    if (req.method() === "GET") {
      const key = url.searchParams.get("serviceKey");
      const list = key
        ? state.tickets.filter((t) => t.serviceKey === key)
        : state.tickets;
      await route.fulfill({ json: list });
      return;
    }

    if (req.method() === "DELETE") {
      const m = url.pathname.match(/\/api\/admin\/tickets\/([^/]+)\/(\d+)$/);
      if (!m) {
        await route.fulfill({ status: 400, body: "Bad composite key" });
        return;
      }
      const [, serviceKey, numStr] = m;
      const num = Number(numStr);
      const before = state.tickets.length;
      state.tickets = state.tickets.filter(
        (t) => !(t.serviceKey === serviceKey && t.number === num)
      );
      const changed = state.tickets.length !== before;
      await route.fulfill({ status: changed ? 204 : 404 });
      return;
    }

    await route.continue();
  });

  return state;
}

test.describe.serial("Admin Tickets (real auth + mocked data)", () => {
  let pageObj: AdminTicketsPage;

  test.beforeEach(async ({ page }) => {
    await ensureLoggedInAdmin(page);

    await setupAdminDataMocks(page);

    pageObj = new AdminTicketsPage(page);
    await pageObj.goto(BASE_URL);
    await pageObj.waitForLoadingToFinish();
  });

  test("lists all tickets by default", async () => {
    await pageObj.expectTicketsCount(3);
  });

  test("filters by service", async () => {
    await pageObj.selectService("ACC");
    await pageObj.clickRefresh();
    await pageObj.waitForLoadingToFinish();
    await pageObj.expectTicketsCount(1);

    await pageObj.selectService("LOAN");
    await pageObj.clickRefresh();
    await pageObj.waitForLoadingToFinish();
    await pageObj.expectTicketsCount(1);

    await pageObj.selectService("SUP");
    await pageObj.clickRefresh();
    await pageObj.waitForLoadingToFinish();
    await pageObj.expectTicketsCount(1);
  });
});
