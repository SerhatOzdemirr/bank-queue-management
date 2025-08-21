import { test, expect } from "@playwright/test";
import { LoginPage } from "../page-objects/login.page";

const BASE_URL = "http://localhost:4200";

test.describe.serial("Login Page", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateTo(BASE_URL);
  });

  test("should show error if fields are empty", async () => {
    await loginPage.login("", "");
    const error = await loginPage.getErrorMessage();
    expect(error?.trim()).toBe("All fields are required.");
  });

  test("should show error for invalid credentials", async () => {
    await loginPage.login("nonexisting@mail.com", "wrongpass");
    const error = await loginPage.getErrorMessage();
    expect(error?.trim()).toBe("User not found.");
  });

  test("default user should login successfully with valid credentials and redirect to /numerator", async ({
    page,
  }) => {
    await loginPage.login("testdefault@mail.com", "123");

    await expect(page).toHaveURL(/\/numerator\b/);

    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBeTruthy();
  });
  test("admin user should login successfully with valid credentials and redirect to /admin-dashboard", async ({
    page,
  }) => {
    await loginPage.login("u1@mail.com", "123");
    await expect(page).toHaveURL(/\/dashboard\b/);

    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBeTruthy();
  });
});
