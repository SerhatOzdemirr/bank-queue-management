import { test, expect } from "@playwright/test";
import { LoginPage } from "../page-objects/login.page";
import { initializePageObject, BASE_URL } from "../utils/testSetup";

test.describe.serial("Login POM", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, context, request }) => {
    loginPage = await initializePageObject(
      page,
      context,
      request,
      LoginPage,
      (instance) => instance.navigateTo(BASE_URL)
    );
  });

  test("Should show error if fields are empty", async () => {
    await loginPage.login("", "");
    const error = await loginPage.getErrorMessage();
    expect(error).toBe("All fields are required.");
  });

  test("Should show error for non-registered user ", async () => {
    await loginPage.login("nonexisting@mail.com", "nonexistuser");
    const error = await loginPage.getErrorMessage();
    expect(error).toBe("User not found.");
  });

  test("Successful login redirects to /numerator", async ({ page }) => {
    await loginPage.login("u1@mail.com", "123");
    await expect(page).toHaveURL(/\/numerator$/);
  });
});
