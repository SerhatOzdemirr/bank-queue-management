import { test, expect, Page } from "@playwright/test";
import { ServiceManagementPage } from "../page-objects/service-management.page";
import {ensureLoggedInAdminForServiceManagement} from "../utils/auth"
const BASE_URL = "http://localhost:4200";

function setupMockAdminServices(page: Page, seed?: any[]) {
  let services = (seed ?? []).map((s) => ({ ...s }));
  let nextId = Math.max(0, ...services.map((s) => s.id ?? 0)) + 1;

  page.route("**/api/admin/services", async (route) => {
    const req = route.request();
    if (req.method() === "GET") {
      const sorted = [...services].sort(
        (a, b) => b.priority - a.priority || a.label.localeCompare(b.label)
      );
      return route.fulfill({
        status: 200,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify(sorted),
      });
    }

    if (req.method() === "POST") {
      const dto = await req.postDataJSON();
      const created = {
        id: nextId++,
        serviceKey: dto.serviceKey?.trim(),
        label: dto.label?.trim(),
        isActive: !!dto.isActive,
        maxNumber: Number(dto.maxNumber ?? 0),
        priority: Number(dto.priority),
        currentNumber: 0,
      };
      services.push(created);
      return route.fulfill({
        status: 201,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify(created),
      });
    }

    return route.fallback();
  });

  page.route("**/api/admin/services/*", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const id = Number(url.pathname.split("/").pop());

    if (req.method() === "PUT") {
      const dto = await req.postDataJSON();
      const idx = services.findIndex((s) => s.id === id);
      if (idx === -1)
        return route.fulfill({ status: 404, body: "Not Found" });

      services[idx] = {
        ...services[idx],
        ...(dto.serviceKey !== undefined && { serviceKey: dto.serviceKey?.trim() }),
        ...(dto.label !== undefined && { label: dto.label?.trim() }),
        ...(dto.isActive !== undefined && { isActive: !!dto.isActive }),
        ...(dto.maxNumber !== undefined && { maxNumber: Number(dto.maxNumber) }),
        ...(dto.priority !== undefined && { priority: Number(dto.priority) }),
      };
      return route.fulfill({ status: 204, body: "" });
    }

    if (req.method() === "DELETE") {
      services = services.filter((s) => s.id !== id);
      return route.fulfill({ status: 204, body: "" });
    }

    return route.fallback();
  });
}

const INITIAL = [
  { id: 1, serviceKey: "acct",  label: "Account", isActive: true,  maxNumber: 100, priority: 3, currentNumber: 0 },
  { id: 2, serviceKey: "loan",  label: "Loans",   isActive: true,  maxNumber: 50,  priority: 5, currentNumber: 0 },
  { id: 3, serviceKey: "kiosk", label: "Kiosk",   isActive: false, maxNumber: 25,  priority: 2, currentNumber: 0 },
];

test.describe.serial("Admin › Service Management (mocked API, no DB)", () => {
  test.beforeEach(async ({ page }) => {
    setupMockAdminServices(page, INITIAL);
    ensureLoggedInAdminForServiceManagement(page);
  });

  test("lists services sorted, shows badges and active state", async ({ page }) => {
    const sm = new ServiceManagementPage(page);
    await sm.goto(BASE_URL);

    await expect(sm.rows).toHaveCount(3);
    await expect(sm.rows.nth(0).locator("td").nth(1)).toContainText("Loans");
    await expect(sm.rows.nth(1).locator("td").nth(1)).toContainText("Account");
    await expect(sm.rows.nth(2).locator("td").nth(1)).toContainText("Kiosk");

    await sm.expectPriorityBadge("Loans", "P5");
    await sm.expectPriorityBadge("Account", "P3");
    await sm.expectPriorityBadge("Kiosk", "P2");

    await sm.expectActive("Loans", true);
    await sm.expectActive("Kiosk", false);
  });

  test("adds a new service", async ({ page }) => {
    const sm = new ServiceManagementPage(page);
    await sm.goto(BASE_URL);

    await sm.openAddModal();
    await sm.fillAddForm("vip", "VIP Desk", 10, 4, true);
    await sm.saveAdd();

    await sm.expectServiceVisible("VIP Desk");
    await sm.expectPriorityBadge("VIP Desk", "P4");
    await sm.expectActive("VIP Desk", true);
  });

  test("edits an existing service (label, priority, active)", async ({ page }) => {
    const sm = new ServiceManagementPage(page);
    await sm.goto(BASE_URL);

    await sm.openEditModalByLabel("Loans");
    await sm.fillEditForm("loan", "Loans & Credits", 60, 4, false);
    await sm.saveEdit();

    await sm.expectServiceVisible("Loans & Credits");
    await sm.expectPriorityBadge("Loans & Credits", "P4");
    await sm.expectActive("Loans & Credits", false);
  });

  test("toggles active from the list row", async ({ page }) => {
    const sm = new ServiceManagementPage(page);
    await sm.goto(BASE_URL);

    await sm.expectActive("Account", true);
    await sm.toggleActive("Account");
    await sm.expectActive("Account", false);

    await sm.toggleActive("Account");
    await sm.expectActive("Account", true);
  });

  test("deletes a service", async ({ page }) => {
    const sm = new ServiceManagementPage(page);
    await sm.goto(BASE_URL);

    await sm.deleteByLabel("Kiosk");
    await expect(sm.rows).toHaveCount(2);
    await sm.expectServiceNotVisible("Kiosk");
  });
});
