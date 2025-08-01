import { Page, expect, test } from "@playwright/test";
import { AdminSidebarPage } from "../page-objects/admin-sidebar.page";
import { BASE_URL, initializePageObject } from "../utils/testSetup";
import { LoginPage } from "../page-objects/login.page";

test.describe.serial("Admin Sidebar POM Tests", () => {
  let adminSidebar: AdminSidebarPage;
  let loginPage: LoginPage;
  test.beforeEach(async ({ page, context, request }) => {
    adminSidebar = await initializePageObject(
      page,
      context,
      request,
      AdminSidebarPage,
      (instance) => instance.navigateTo(BASE_URL)
    );

    loginPage = await initializePageObject(
      page,
      context,
      request,
      LoginPage,
      (instance) => instance.navigateTo(BASE_URL)
    );
  });

  test("goto dashboard link", async ({ page }) => {
    await loginPage.login("admin@mail.com", "123456");
    await adminSidebar.gotoDashboard();
    await expect(page).toHaveURL(`${BASE_URL}/admin`);
  });
  test("goto service management link", async ({ page }) => {
    await loginPage.login("admin@mail.com", "123456");
    await adminSidebar.gotoServiceManagement();
    await expect(page).toHaveURL(`${BASE_URL}/admin/services`);
  });
  test("goto ticket oversight link", async ({ page }) => {
    await loginPage.login("admin@mail.com", "123456");
    await adminSidebar.gotoTicketOversight();
    await expect(page).toHaveURL(`${BASE_URL}/admin/tickets`);
  });
  test("logout link", async ({ page }) => {
    await loginPage.login("admin@mail.com", "123456");
    await adminSidebar.logout();
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });
});
