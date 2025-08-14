import { expect, test } from "@playwright/test";
import { initializePageObject, BASE_URL } from "../utils/testSetup";
import { LoginPage } from "../page-objects/login.page";
import { ServiceManagementPage } from "../page-objects/service-management.page";

let loginPage: LoginPage;
let svcPage: ServiceManagementPage;

test.describe.serial("Admin login and go to Service Management", () => {
  test.beforeEach(async ({ page, context, request }) => {
    // LoginPage instance
    loginPage = new LoginPage(page);

    // ServiceManagementPage instance
    svcPage = new ServiceManagementPage(page);

    // DB reset and go to login page
    await initializePageObject(page, context, request, LoginPage, async (p) => {
      await p.navigateTo(BASE_URL);
    });

    // Login as admin user
    await loginPage.navigateTo(BASE_URL);
    await loginPage.login("admin@mail.com", "123456");

    // Route to admin service management page
    await svcPage.gotoServiceManagementPage(BASE_URL);
  });

  test("add a service", async () => {
    await svcPage.openAddServiceModal();
    await svcPage.fillAddForm("TestService", "TestLabel", 10, 3, true);
    await svcPage.saveAdd();
    await svcPage.expectServiceExists("TestLabel");
  });
  test("edit a service", async () => {
    await svcPage.openEditModal(0);
    await svcPage.fillEditForm("svc-1", "Service One Updated", 60, 4, true);
    await svcPage.saveEdit();
    await svcPage.expectServiceExists("Service One Updated");
  });
  test("cancel add a service", async () => {
    await svcPage.openAddServiceModal();
    await svcPage.fillAddForm("TestService", "TestLabel", 10, 3, true);
    await svcPage.cancelAdd();
    expect(svcPage.header.filter({ hasText: "Service Management" }));
  });
  test("cancel edit a service", async () => {
    await svcPage.openEditModal(0);
    await svcPage.fillEditForm("svc-1", "Service One Updated", 60, 4, true);
    await svcPage.cancelEdit();
    expect(svcPage.header.filter({ hasText: "Service Management" }));
  });
  test("delete a service ", async () => {
    await svcPage.deleteService(0);
  });
});
