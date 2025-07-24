import { test, expect } from "@playwright/test";

const baseUrl = "http://localhost:4200";

async function signup(
  page: any,
  username: string,
  email: string,
  password: string
) {
  // Navigate to the signup page
  await page.goto(`${baseUrl}/`);
  await page.getByPlaceholder("Username").fill(username);
  await page.getByPlaceholder("E-mail").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: "Sign Up" }).click();
}

async function login(
  page: any,
  username: string,
  email: string,
  password: string
) {
  // Navigate to the login (root) page
  await page.goto(`${baseUrl}/login`);
  await page.getByPlaceholder("Username").fill(username);
  await page.getByPlaceholder("E-mail").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
}

async function takeNumber(page: any, expectedNumber: number) {
  const btn = page.getByRole("button", { name: "Take the Number" });
  await expect(btn).toBeVisible();
  await btn.click();
  await expect(page.locator(".taken-number")).toHaveText(
    `Your Number is: ${expectedNumber}`
  );
}

test.describe("Numerator App – Registration & Login", () => {
  test.beforeEach(async ({ page }) => {
    // Reset state before each test
    await page.goto(baseUrl);
    await page.evaluate(() => localStorage.clear());
  });

  test("Signup: all fields required", async ({ page }) => {
    await signup(page, "", "", "");
    await expect(page.locator(".signup-error")).toHaveText(
      "All fields are required."
    );
  });

  test("Login: all fields required", async ({ page }) => {
    await login(page, "", "", "");
    await expect(page.locator(".login-error")).toHaveText(
      "All fields are required."
    );
  });

  test("New users receive sequential numbers 1–5", async ({ page }) => {
    const users = [
      { username: "User1", email: "u1@mail.com", password: "123" },
      { username: "User2", email: "u2@mail.com", password: "124" },
      { username: "User3", email: "u3@mail.com", password: "125" },
      { username: "User4", email: "u4@mail.com", password: "126" },
      { username: "User5", email: "u5@mail.com", password: "127" },
    ];
    for (let i = 0; i < users.length; i++) {
      const { username, email, password } = users[i];
      await signup(page, username, email, password);
      await login(page, username, email, password);
      await takeNumber(page, i + 1);
    }
  });

  test("Signup: duplicate email shows error", async ({ page }) => {
    await signup(page, "Carol", "dup2@mail.com", "pw2");
    await login(page, "Carol", "dup2@mail.com", "pw2");
    await takeNumber(page, 1);

    // Attempt to register a new user with the same email
    await signup(page, "Dave", "dup2@mail.com", "pwX");
    await expect(page.locator(".signup-error")).toHaveText(
      "This email has already been used by another user."
    );
  });

  test("Email comparisons are case‑insensitive", async ({ page }) => {
    await signup(page, "CaseUser", "CASE@MAIL.COM", "pwCase");
    await login(page, "CaseUser", "CASE@MAIL.COM", "pwCase");
    await takeNumber(page, 1);

    // Logging in with lower‑case email should still work
    await login(page, "CaseUser", "case@mail.com", "pwCase");
    await takeNumber(page, 1);
  });

  test("Fields are trimmed before processing", async ({ page }) => {
    await signup(
      page,
      "   TrimUser   ",
      "  trim@mail.com  ",
      "  pwTrim  "
    );
    await login(page, "TrimUser", "trim@mail.com", "pwTrim");
    await takeNumber(page, 1);
  });

  test("Login without prior signup shows error", async ({ page }) => {
    await login(page, "Ghost", "ghost@mail.com", "nope");
    await expect(page.locator(".login-error")).toHaveText(
      "User not found. Please sign up first."
    );
  });
});
