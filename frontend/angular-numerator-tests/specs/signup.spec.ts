import { test, expect } from "@playwright/test";
import { SignupPage } from "../page-objects/signup.page";
import { uniq, uniqueEmail } from "../utils/random";

const BASE_URL = "http://localhost:4200";

test.describe.serial("Signup Page", () => {
  let signup: SignupPage;

  test.beforeEach(async ({ page }) => {
    signup = new SignupPage(page);
    await signup.navigateTo(BASE_URL);
    await expect(page).toHaveURL(/\/signup\b/);
  });

  test("should show validation error when fields are empty", async () => {
    await signup.signup("", "", "");
    await expect(signup.signupError).toBeVisible();
    const msg = (await signup.getErrorMessage())?.toLowerCase() || "";
    expect(msg).toMatch(/required|zorunlu|empty/);
  });

  test("should show error for invalid email format", async () => {
    const username = uniq("user");
    await signup.signup(username, "wrong@", "Passw0rd!");
    await expect(signup.signupError).toBeVisible();
    const msg = (await signup.getErrorMessage())?.toLowerCase() || "";
    expect(msg).toMatch(/email|format|valid/);
  });

  test("should prevent signup with an existing email", async () => {
    const username = uniq("user");
    await signup.signup(username, "testdefault@mail.com", "Passw0rd!");
    await expect(signup.signupError).toBeVisible();
    const msg = (await signup.getErrorMessage())?.toLowerCase() || "";
    expect(msg).toMatch(/exist|already|taken|registered|mevcut|kayıt/);
  });

  test("should signup successfully with a unique email", async ({ page }) => {
    const username = uniq("user");
    const email = uniqueEmail("user", "mail.com");
    await signup.signup(username, email, "Passw0rd!");
    await expect(page).toHaveURL(/\/(profile|login)\b/);
  });
});
