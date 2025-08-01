import { expect, test } from "@playwright/test";
import { SingupPage } from "../page-objects/signup.page";
import { initializePageObject, BASE_URL } from "../utils/testSetup";

test.describe("Sign Up POM", () => {
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

  test("Navigate to login page after signup ", async ({page}) => {
    await signupPage.signup("newUserTest", "newusertest@mail.com", "123456");
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test("Invalid email format" , async () => {
    await signupPage.signup("abc" , "invalidusermail", "123");
    const error = await signupPage.getErrorMessage();
    expect(error).toBe("Invalid email address.");
  })
  
});
