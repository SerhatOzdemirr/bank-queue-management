import { expect, test } from "@playwright/test";
import { SingupPage } from "../page-objects/signup.page";
import { initializePageObject, BASE_URL } from "../utils/testSetup";
import { uniq, uniqueEmail } from "../utils/random";

test.describe.serial("Sign Up POM", () => {
  let signupPage: SingupPage;

  test.beforeEach(async ({ page, context, request }) => {
    signupPage = await initializePageObject(
      page,
      context,
      request,
      SingupPage,
      (instance) => instance.navigateTo(BASE_URL)
    );
  });

  test("Should show error if fields are empty", async () => {
    await signupPage.signup(" ", "", "");
    const error = await signupPage.getErrorMessage();
    expect(error).toBe("All fields are required.");
  });

  test("Navigate to login page after signup", async ({ page }) => {
    const username = uniq("usr");
    const email = uniqueEmail("usr");
    const password = "P@ssw0rd123!";

    await signupPage.signup(username, email, password);
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test("Invalid email format", async () => {
    const username = uniq("badmail");
    const email = `${uniq("bad")}invalid`; 
    const password = "123456";

    await signupPage.signup(username, email, password);
    const error = await signupPage.getErrorMessage();
    expect(error).toBe("Invalid email address.");
  });
});
