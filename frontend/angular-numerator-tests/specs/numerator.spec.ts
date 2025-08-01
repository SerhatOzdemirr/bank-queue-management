import { test, expect } from "@playwright/test";
import { LoginPage } from "../page-objects/login.page";
import { NumeratorPage } from "../page-objects/numerator.page";
import { initializePageObject, BASE_URL } from "../utils/testSetup";
import { SingupPage } from "../page-objects/signup.page";

test.describe.serial("Numerator Page – POM Tests", () => {
  let loginPage: LoginPage;
  let signupPage: SingupPage;
  let numPage: NumeratorPage;

  test.beforeEach(async ({ page, context, request }) => {
    // Sign in user
    loginPage = await initializePageObject(
      page,
      context,
      request,
      LoginPage,
      (instance) => instance.navigateTo(BASE_URL)
    );
    signupPage = await initializePageObject(
      page,
      context,
      request,
      SingupPage,
      (instance) => instance.navigateTo(BASE_URL)
    );
    // Navigate to numerator
    numPage = new NumeratorPage(page);
    await numPage.navigate(BASE_URL);
  });

  test("Stepper shows all three steps before action", async () => {
    await loginPage.login("u1@mail.com", "123");
    const active = await numPage.getActiveStepLabels();
    expect(active).toEqual(["1. Select Service"]);
  });

  test("Selecting a service enables Step 2 and shows Take button", async () => {
    await loginPage.login("u1@mail.com", "123");
    await numPage.selectService("Credit Card");
    const active = await numPage.getActiveStepLabels();
    expect(active).toEqual(["1. Select Service", "2. Take a Number"]);
    await expect(numPage.takeNumberButton).toBeEnabled();
  });

  test("After taking a number, shows result and correct data", async () => {
    await loginPage.login("u1@mail.com", "123");
    await numPage.selectService("Credit Card");
    await numPage.clickTakeNumber();

    const active = await numPage.getActiveStepLabels();
    expect(active).toEqual([
      "1. Select Service",
      "2. Take a Number",
      "3. Result",
    ]);

    const result = await numPage.getResultText();
    expect(result).toMatch(/Your Number is: \d+/);

    const num = await numPage.getTakenNumber();
    const label = await numPage.getServiceLabel();
    const taken = await numPage.getTakenAt();
    expect(num).toBeTruthy();
    expect(label).toContain("Credit Card");
    expect(taken).toMatch(/\d+:\d+/);
  });

  test("New operation button resets to step 1", async () => {
    await loginPage.login("u1@mail.com", "123");
    await numPage.selectService("Credit Card");
    await numPage.clickTakeNumber();
    await numPage.newOperationButton.click();

    const active = await numPage.getActiveStepLabels();
    expect(active).toEqual(["1. Select Service"]);
  });
  test("5 Users register and login, receive 5 sequential numbers", async ({
    page,
  }) => {
    const numPage = new NumeratorPage(page);
    const signupPage = new SingupPage(page);
    const loginPage = new LoginPage(page);

    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());

    const users = [
      { username: "User6", email: "u6@mail.com", password: "123" },
      { username: "User7", email: "u7@mail.com", password: "124" },
      { username: "User8", email: "u8@mail.com", password: "125" },
      { username: "User9", email: "u9@mail.com", password: "126" },
      { username: "User10", email: "u10@mail.com", password: "127" },
    ];

    for (let i = 0; i < users.length; i++) {
      const { username, email, password } = users[i];

      // Signup
      await signupPage.navigateTo(BASE_URL);
      await signupPage.signup(username, email, password);

      // Login
      await loginPage.navigateTo(BASE_URL);
      await loginPage.login(email, password);

      // Navigate & take number
      await numPage.navigate(BASE_URL);
      await numPage.selectService("Credit Card");
      await numPage.clickTakeNumber();

      const number = await numPage.getTakenNumber();
      expect(Number(number)).toBe(i + 1);
    }
  });
});
