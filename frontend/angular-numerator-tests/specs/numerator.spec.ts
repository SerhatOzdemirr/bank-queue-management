import { test, expect, Page } from "@playwright/test";
import { NumeratorPage } from "../page-objects/numerator.page";
import { ensureLoggedInDefault } from "../utils/auth";

const FRONT_URL = "http://localhost:4200";

/* ----------------------- In-memory Mock API ----------------------- */
type Service = {
  id: number;
  serviceKey: string; // svc.Key
  label: string; // svc.Label
  maxNumber: number; // svc.MaxNumber
  currentNumber: number; // counter.CurrentNumber
  isActive: boolean; // svc.IsActive
  priority: number; 
};

function setupMockQueueApi(page: Page, seed: Service[]) {
  let services: Service[] = seed.map((s) => ({ ...s }));
  const findByKey = (key: string) => services.find((s) => s.serviceKey === key);

  /* ---------- GET services (priority desc, label asc) ---------- */
  page.route("**/api/**/services", async (route) => {
    if (route.request().method() !== "GET") return route.fallback();

    const sorted = [...services].sort(
      (a, b) => b.priority - a.priority || a.label.localeCompare(b.label)
    );

    return route.fulfill({
      status: 200,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify(
        sorted.map((s) => ({
          id: s.id,
          serviceKey: s.serviceKey,
          label: s.label,
          maxNumber: s.maxNumber,
          currentNumber: s.currentNumber,
          isActive: s.isActive,
          priority: s.priority,
        }))
      ),
    });
  });

  /* ---------- TAKE NUMBER (NumeratorService.GetNextAsync) ---------- */
  const handleTake = async (route: any) => {
    const req = route.request();
    let serviceKey = "";

    if (req.method() === "GET") {
      const url = new URL(req.url());
      serviceKey =
        url.searchParams.get("service") ||
        url.searchParams.get("serviceKey") ||
        "";
    } else {
      const body = (await req.postDataJSON?.()) || {};
      serviceKey = String(body.service ?? body.serviceKey ?? body.key ?? "");
    }

    const svc = findByKey(serviceKey);
    if (!svc || !svc.isActive) {
      return route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ message: "Service not found or inactive" }),
      });
    }

    if (svc.currentNumber >= svc.maxNumber) {
      return route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          message: "This service reached the maximum number.",
        }),
      });
    }

    const number = ++svc.currentNumber; 

    const ticket = {
      number,
      serviceKey: svc.serviceKey,
      serviceLabel: svc.label,
      takenAt: new Date().toISOString(),
      userId: 1, 
      username: "user", 
      assignedAgentId: null, 
      assignedAt: null,
      assignmentStatus: "Pending",
    };

    return route.fulfill({
      status: 200,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify(ticket),
    });
  };

  page.route("**/api/**/numerator/next**", handleTake);
  page.route("**/api/**/tickets/take", handleTake);

  /* ---------- CANCEL (NumeratorService.CancelTicketAsync) ---------- */
  const handleCancel = async (route: any) => {
    const req = route.request();
    const body = (await req.postDataJSON?.()) || {};
    const key = String(body.serviceKey ?? body.service ?? "");
    const svc = findByKey(key);

    if (!svc) {
      return route.fulfill({
        status: 404,
        body: JSON.stringify({ ok: false }),
      });
    }

    if (svc.currentNumber > 0) svc.currentNumber--; 
    return route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
  };

  page.route("**/api/**/numerator/cancel", handleCancel);
  page.route("**/api/**/tickets/cancel", handleCancel);

  /* ---------- RESET (TestController.Reset) ---------- */
  page.route("**/api/**/test/reset", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    return route.fulfill({
      status: 200,
      body: JSON.stringify({ reset: true }),
    });
  });
}

/* ----------------------- Seed data ----------------------- */
const SEED: Service[] = [
  {
    id: 1,
    serviceKey: "acct",
    label: "Account",
    isActive: true,
    maxNumber: 5,
    currentNumber: 2,
    priority: 3,
  },
  {
    id: 2,
    serviceKey: "loan",
    label: "Loans",
    isActive: true,
    maxNumber: 3,
    currentNumber: 3,
    priority: 5,
  }, 
  {
    id: 3,
    serviceKey: "kiosk",
    label: "Kiosk",
    isActive: false,
    maxNumber: 4,
    currentNumber: 1,
    priority: 2,
  },
  {
    id: 4,
    serviceKey: "vip",
    label: "VIP Desk",
    isActive: true,
    maxNumber: 9,
    currentNumber: 0,
    priority: 4,
  },
  {
    id: 5,
    serviceKey: "cust1",
    label: "Customer Care 1",
    isActive: true,
    maxNumber: 9,
    currentNumber: 0,
    priority: 1,
  },
  {
    id: 6,
    serviceKey: "cust2",
    label: "Customer Care 2",
    isActive: true,
    maxNumber: 9,
    currentNumber: 0,
    priority: 1,
  },
  {
    id: 7,
    serviceKey: "cust3",
    label: "Customer Care 3",
    isActive: true,
    maxNumber: 9,
    currentNumber: 0,
    priority: 1,
  },
  {
    id: 8,
    serviceKey: "cust4",
    label: "Customer Care 4",
    isActive: true,
    maxNumber: 9,
    currentNumber: 0,
    priority: 1,
  },
  {
    id: 9,
    serviceKey: "cust5",
    label: "Customer Care 5",
    isActive: true,
    maxNumber: 9,
    currentNumber: 0,
    priority: 1,
  },
];

/* ======================= TESTS ======================= */
test.describe.serial("Numerator (mocked API, no DB)", () => {
  test.beforeEach(async ({ page }) => {
    setupMockQueueApi(page, SEED);
    await ensureLoggedInDefault(page);
  });

  test("priority ordering & pagination: first page shows top-3 by priority", async ({
    page,
  }) => {
    const np = new NumeratorPage(page);
    await np.goto(FRONT_URL);

    await expect(np.serviceCards).toHaveCount(3);

    const titles = (await np.visibleCardTitles()).map((t) => t.trim());
    expect(titles).toEqual(["Loans", "VIP Desk", "Account"]);

    await np.expectCardDisabled("Loans");
  });

  test("take number → result shows correct ticket and meta", async ({
    page,
  }) => {
    const np = new NumeratorPage(page);
    await np.goto(FRONT_URL);

    await np.selectService("Account");
    await np.clickTakeNumber();

    await np.expectResultVisible();
    expect(await np.readTakenNumber()).toBe(3);
    expect(await np.readServiceText()).toContain("Service:");
    expect(await np.readServiceText()).toContain("Account");

    const steps = await np.activeSteps();
    expect(steps.join(" ")).toContain("3. Result");
  });

  test("cancel ticket hits API, then New Operation returns to step 1", async ({
    page,
  }) => {
    const np = new NumeratorPage(page);
    await np.goto(FRONT_URL);

    await np.selectService("VIP Desk");
    await np.clickTakeNumber();
    await np.expectResultVisible();

    await np.clickCancelTicket();
    await np.clickNewOperation();

    const steps = await np.activeSteps();
    expect(steps.join(" ")).toContain("1. Select Service");
    await expect(np.serviceCards.first()).toBeVisible();
  });

  test("pagination works across 3-card pages", async ({ page }) => {
    const np = new NumeratorPage(page);
    await np.goto(FRONT_URL);

    await expect(np.cardByLabel("Account")).toHaveCount(1);

    await np.pagerNext.click();
    await expect(np.cardByLabel("Kiosk")).toHaveCount(1);

    await np.pagerNext.click();
    await expect(np.cardByLabel("Customer Care 5")).toHaveCount(1);

    await np.pagerPrev.click();
    await expect(np.cardByLabel("Kiosk")).toHaveCount(1);

    const pageBtnCount = await np.pagerButtons.count();
    if (pageBtnCount >= 3) {
      await np.pagerButtons.nth(0).click(); 
      await expect(np.cardByLabel("Loans")).toHaveCount(1);
    }
  });

  test("full service cannot take number (UI'da disabled card)", async ({
    page,
  }) => {
    const np = new NumeratorPage(page);
    await np.goto(FRONT_URL);

    await np.expectCardDisabled("Loans");
  });
});
