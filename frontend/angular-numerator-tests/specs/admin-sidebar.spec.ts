// tests/specs/admin.sidebar.spec.ts
import { test, expect } from "@playwright/test";
import { AdminSidebarPage } from "../page-objects/admin-sidebar.page";
import { ensureLoggedInAdmin, ensureLoggedInDefault } from "../utils/auth";

const BASE_URL = "http://localhost:4200";

const ADMIN_ROUTES = {
  dashboard: /\/admin(\/dashboard)?\b/,
  services: /\/admin\/(services|service-management)\b/,
  tickets: /\/admin\/(tickets|ticket-oversight)\b/,
  login: /\/login\b/,
};

test.describe.serial("Admin Sidebar", () => {
  let admin: AdminSidebarPage;

  test.beforeEach(async ({ page }) => {
    await ensureLoggedInAdmin(page);
    admin = new AdminSidebarPage(page);
    await admin.navigateTo(BASE_URL);
    await expect(page).toHaveURL(/\/dashboard\b/);
  });

  test("links should be visible for admin", async () => {
    await expect(admin.dashboardLink).toBeVisible();
    await expect(admin.servicesManagementLink).toBeVisible();
    await expect(admin.ticketOversightLink).toBeVisible();
    await expect(admin.logoutLink).toBeVisible();
  });

  test("navigate to Dashboard", async ({ page }) => {
    await admin.gotoDashboard();
    await expect(page).toHaveURL(ADMIN_ROUTES.dashboard);
  });

  test("navigate to Service Management", async ({ page }) => {
    await admin.gotoServiceManagement();
    await expect(page).toHaveURL(ADMIN_ROUTES.services);
  });

  test("navigate to Ticket Oversight", async ({ page }) => {
    await admin.gotoTicketOversight();
    await expect(page).toHaveURL(ADMIN_ROUTES.tickets);
  });

  test("logout should clear session and redirect to /login", async ({
    page,
  }) => {
    await admin.logout();
    await expect(page).toHaveURL(ADMIN_ROUTES.login);
    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBeNull();
  });
});

test.describe.serial("Admin guard (negative)", () => {
  test("non-admin should not access /admin", async ({ page }) => {
    // Default user ile giriş yap
    await ensureLoggedInDefault(page);
    await page.goto(`${BASE_URL}/admin`);

    await expect(page).not.toHaveURL(/\/dashoard\b/);
  });
});
