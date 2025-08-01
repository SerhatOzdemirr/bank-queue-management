import { test, expect } from "@playwright/test";
import { AdminSignupPage } from "../page-objects/admin-signup.page";
import { BASE_URL, initializePageObject } from "../utils/testSetup";
import { LoginPage } from "../page-objects/login.page";

test.describe.serial("Admin Signup – POM Tests", () => {
  let adminSignup: AdminSignupPage;
  let loginPage: LoginPage;
  const random = Math.floor(Math.random() * 10000);

  test.beforeEach(async ({ page, context, request }) => {
    loginPage = await initializePageObject(
      page,
      context,
      request,
      LoginPage,
      (instance) => instance.navigateTo(BASE_URL)
    );

    await loginPage.login("admin@mail.com", "123456");

    adminSignup = new AdminSignupPage(page);
    await adminSignup.navigateTo(`${BASE_URL}/admin/create`);
  });
  
  test("Should show error if fields are empty", async () => {
    await loginPage.navigateTo(`${BASE_URL}`);
    await loginPage.login("admin@mail.com", "123456");
    await adminSignup.navigateTo(BASE_URL);
    await adminSignup.createAdmin("", "", "");
    const error = await adminSignup.getErrorMessage();
    expect(error?.trim()).toBe("All fields are required.");
  });

  test("Should successfully create admin with valid data", async ({ page }) => {
    await loginPage.navigateTo(`${BASE_URL}`);
    await loginPage.login("admin@mail.com", "123456");
    await adminSignup.navigateTo(BASE_URL);
    const email = `admin${random}@mail.com`;
    const username = `admin${random}`;
    await adminSignup.createAdmin(username, email, "admin123");
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test("Should show error for duplicate email", async () => {
    await loginPage.navigateTo(`${BASE_URL}`);
    await loginPage.login("admin@mail.com", "123456");
    await adminSignup.navigateTo(BASE_URL);
    await adminSignup.createAdmin(
      "adminduplicateemail",
      "adminduplicate@mail.com",
      "admin123"
    );
    await adminSignup.createAdmin(
      "adminduplicateemail2",
      "adminduplicate@mail.com",
      "admin456"
    );
    const error = await adminSignup.getErrorMessage();
    expect(error?.toLowerCase()).toContain("email already in use.");
  });

  test("Admin guard is worked", async ({page}) => {
    await loginPage.navigateTo(`${BASE_URL}`);
    await loginPage.login("u1@mail.com", "123");
    await adminSignup.navigateToAdmin(BASE_URL);
    await expect(page).toHaveURL(`${BASE_URL}/signup`)

  });

  test("Invalid email format admin signup" , async () => {
    await loginPage.navigateTo(`${BASE_URL}`);
    await loginPage.login("admin@mail.com", "123456");
    await adminSignup.navigateTo(BASE_URL);
    await adminSignup.createAdmin("abc" ,"abcmail" ,"123");
    const error = await adminSignup.getErrorMessage();
    expect(error).toBe("Invalid email address.");
  })
});
