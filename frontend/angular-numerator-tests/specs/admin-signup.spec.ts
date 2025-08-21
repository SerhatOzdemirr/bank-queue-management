import { test, expect } from "@playwright/test";
import { AdminSignupPage } from "../page-objects/admin-signup.page";
import { uniq, uniqueEmail } from "../utils/random";
import { ensureLoggedInAdmin, ensureLoggedInDefault } from "../utils/auth";

const BASE_URL = "http://localhost:4200";

test.describe.serial("Admin › Create Admin", () => {
  let adminSignup: AdminSignupPage;
  test.beforeEach(async ({ page }) => {
    await ensureLoggedInAdmin(page);
    adminSignup = new AdminSignupPage(page);
    await adminSignup.navigateTo(BASE_URL);
    await expect(page).toHaveURL(/\/admin\/create\b/);
    await expect(adminSignup.adminTitle).toBeVisible();
  });

  test("should show validation error when fields are empty", async () => {
    await adminSignup.createAdmin("", "", "");
    await expect(adminSignup.errorMessage).toBeVisible();
    const msg =
      (await adminSignup.getErrorMessage())?.trim().toLowerCase() || "";
    expect(msg).toMatch(/required|zorunlu|empty|boş/);
  });

  test("should show error for invalid email format", async () => {
    const username = uniq("e2e_admin");
    await adminSignup.createAdmin(username, "wrong@", "Passw0rd!");
    await expect(adminSignup.errorMessage).toBeVisible();
    const msg =
      (await adminSignup.getErrorMessage())?.trim().toLowerCase() || "";
    expect(msg).toMatch(/email|format|valid/);
  });

  test("should prevent creating admin with an existing email", async () => {
    const username = uniq("e2e_admin");
    await adminSignup.createAdmin(username, "u1@mail.com", "Passw0rd!");
    await expect(adminSignup.errorMessage).toBeVisible();
    const msg =
      (await adminSignup.getErrorMessage())?.trim().toLowerCase() || "";
    expect(msg).toMatch(/exist|already|taken|registered|mevcut|kayıt/);
  });

  test("should create admin successfully with unique email", async ({
    page,
  }) => {
    const username = uniq("e2e_admin");
    const email = uniqueEmail("e2e.admin", "mail.com");
    await adminSignup.createAdmin(username, email, "Passw0rd!");

    await expect(page).toHaveURL(/\/login(\/.*)?\b/);
  });
});

test.describe.serial("Admin route guard (negative)", () => {
  test("non-admin user cannot access /admin/create", async ({ page }) => {
    await ensureLoggedInDefault(page);
    await page.goto(`${BASE_URL}/admin/create`);
    await expect(page).not.toHaveURL(/\/admin\/create\b/);
  });
});
