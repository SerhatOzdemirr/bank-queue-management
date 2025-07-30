import { test, expect, Page, request } from "@playwright/test";

const baseUrl = "http://localhost:4200";

async function signup(
  page: Page,
  username: string,
  email: string,
  password: string
) {
  await page.goto(`${baseUrl}/`);
  await page.getByPlaceholder("Username").fill(username);
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: "Sign Up" }).click();
}

async function navigateToLoginPage(page: Page) {
  await page.goto(`${baseUrl}/login`);
}

async function login(page: Page, email: string, password: string) {
  await page.goto(`${baseUrl}/login`);
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
}
async function takeNumberFromDeposit(page: Page, expectedNumber: number) {
  await page.locator(".service-card").getByText("Deposit").click();
  await page.getByRole("button", { name: "Take the Number" }).click();

  // Sonuç metnini normalize et: satırlar ve noktalar boşluk yapar
  let text = await page.locator(".result").innerText();
  text = text
    .replace(/[·\n\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Beklenen numarayı kontrol et
  expect(text).toContain(`Your Number is: ${expectedNumber}`);
}

async function takeNumber(page: Page, expectedNumber: number) {
  await page.locator(".service-card").getByText("Cash Withdrawal").click();
  await page.getByRole("button", { name: "Take the Number" }).click();

  // Sonuç metnini normalize et: satırlar ve noktalar boşluk yapar
  let text = await page.locator(".result").innerText();
  text = text
    .replace(/[·\n\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Beklenen numarayı kontrol et
  expect(text).toContain(`Your Number is: ${expectedNumber}`);
}
test.describe.serial("Numerator App – Registration & Login", () => {
  test.beforeEach(async ({ page, context }) => {
    // Tarayıcı durumunu temizle
    await page.goto(baseUrl);
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Backend sayacı sıfırlanıyor
    const apiContext = await request.newContext({
      baseURL: "http://localhost:5034",
    });
    const res = await apiContext.post("/api/test/reset");
    expect(res.ok()).toBeTruthy();
  });

  test("Signup: tüm alanlar zorunlu", async ({ page }) => {
    await signup(page, "", "", "");
    await expect(page.locator(".signup-error")).toHaveText(
      "All fields are required."
    );
  });

  test("Login: tüm alanlar zorunlu", async ({ page }) => {
    await login(page, "", "");
    await expect(page.locator(".login-error")).toHaveText(
      "All fields are required."
    );
  });

  test("Yeni kullanıcılar 1–5 arası numara almalı", async ({
    page,
    context,
  }) => {
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
      await login(page, email, password);
      await takeNumber(page, i + 1);
    }
  });

  test("Duplicate email signup hata vermeli", async ({ page, context }) => {
    await signup(page, "Carol", "dup2@mail.com", "pw2");
    await login(page, "dup2@mail.com", "pw2");
    await takeNumber(page, 1);

    // İzolasyon için temizle
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    await signup(page, "Dave", "dup2@mail.com", "pwX");
    await expect(page.locator(".signup-error")).toHaveText(
      "This email has already been used by another user."
    );
  });

  test("Email karşılaştırması büyük‑küçük harf duyarsız olmalı", async ({
    page,
    context,
  }) => {
    await signup(page, "CaseUser", "CASE@MAIL.COM", "pwCase");
    await login(page, "CASE@MAIL.COM", "pwCase");
    await takeNumberFromDeposit(page, 1);

    // İzolasyon için temizle
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    await login(page, "case@mail.com", "pwCase");
    await takeNumberFromDeposit(page, 2);
  });

  test("Login öncesi signup yapılmazsa hata vermeli", async ({ page }) => {
    await login(page, "ghost@mail.com", "nope");
    await expect(page.locator(".login-error")).toHaveText(
      "User not found. Please sign up first."
    );
  });

  test("Email format doğru mu? (Yanlış)", async ({ page }) => {
    await signup(page, "Serhat", "serhat", "123456");
    await expect(page.locator(".signup-error")).toHaveText(
      "Invalid email address."
    );
  });

  test("Email format doğru mu? (Doğru)", async ({ page }) => {
    await signup(page, "Serhat", "serhat@gmail.com", "123456");
    await navigateToLoginPage(page);
    const signInButton = page.getByRole("button", {
      name: "Sign In",
      exact: true,
    });
    await expect(signInButton).toBeVisible();
    await login(page, "serhat@gmail.com", "123456");
    await expect(page).toHaveURL(/\/numerator/);
    const firstStep = page.locator(".stepper .step-item").first();
    await expect(firstStep).toHaveText("1. Select Service");
  });

  test("Navbar Sign In routing", async ({ page }) => {
    await page.locator(".nav a").filter({ hasText: "Sign In" }).click();
    await expect(page).toHaveURL("http://localhost:4200/login");
  });

  test("Guard: giriş yapmayan kullanıcı /numerator'a erişemez", async ({
    page,
  }) => {
    await page.goto(`${baseUrl}/numerator`);
    await expect(page).toHaveURL(`${baseUrl}/login?returnUrl=%2Fnumerator`);
  });
  test("Guard: giriş yapan kullanıcı /numerator'a erişebilir", async ({
    page,
  }) => {
    await signup(page, "GuardUser", "guard@mail.com", "123");
    await login(page, "guard@mail.com", "123");
    await page.goto(`${baseUrl}/numerator`);
    await expect(page).toHaveURL(/\/numerator$/);
    await expect(page.locator(".stepper")).toBeVisible();
  });
  test("Logout: kullanıcı oturumu kapattığında yönlendirme login'e yapılmalı", async ({
    page,
  }) => {
    // Kullanıcı oluştur ve giriş yap
    await signup(page, "LogoutUser", "logout@mail.com", "123456");
    await login(page, "logout@mail.com", "123456");

    // Numerator sayfasına gittiğinden emin ol
    await expect(page).toHaveURL(/\/numerator$/);
    await expect(page.locator(".logout-btn")).toBeVisible();

    // Logout işlemi
    await page.locator(".logout-btn").click();

    // Login sayfasına yönlendirildiğini ve Sign In butonunun göründüğünü kontrol et
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });
});
