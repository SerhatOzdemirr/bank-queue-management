// tests/specs/navbar.spec.ts
import { test, expect } from "@playwright/test";
import { NavbarPage } from "../page-objects/navbar.page";
import {
  ensureLoggedInAdmin,
  ensureLoggedInAgent,
  ensureLoggedInDefault,
} from "../utils/auth";

const BASE = "http://localhost:4200";

/* -------------------- GUEST -------------------- */
test.describe("Navbar (guest)", () => {
  test("should show auth links and disabled Take Number", async ({ page }) => {
    const nav = new NavbarPage(page);
    await nav.goto(BASE);

    await expect(nav.signInLink).toHaveCount(1);
    await expect(nav.signUpLink).toHaveCount(1);

    await expect(nav.takeNumberLink).toHaveCount(0);

    await expect(nav.logoutButton).toHaveCount(0);
    await expect(nav.profileImageLink).toHaveCount(0);

    await expect(nav.dashboardLink).toHaveCount(0);
    await expect(nav.createAdminLink).toHaveCount(0);
    await expect(nav.createAgentLink).toHaveCount(0);
    await expect(nav.listUsersLink).toHaveCount(0);
    await expect(nav.myTicketsLink).toHaveCount(0);
  });
});

/* -------------------- AGENT -------------------- */
test.describe("Navbar (agent)", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedInAgent(page);
  });

  test("should show agent links and navigate", async ({ page }) => {
    const nav = new NavbarPage(page);
    await nav.goto(BASE);

    // Login olmuş kullanıcıda auth linkleri görünmemeli
    await expect(nav.signInLink).toHaveCount(0);
    await expect(nav.signUpLink).toHaveCount(0);

    // Agent linkleri
    await expect(nav.takeNumberLink).toHaveCount(1);
    await expect(nav.myTicketsLink).toHaveCount(1);
    await expect(nav.logoutButton).toHaveCount(1);
    await expect(nav.profileImageLink).toHaveCount(1);

    // Admin linkleri görünmemeli
    await expect(nav.dashboardLink).toHaveCount(0);
    await expect(nav.createAdminLink).toHaveCount(0);
    await expect(nav.createAgentLink).toHaveCount(0);
    await expect(nav.listUsersLink).toHaveCount(0);

    // Navigasyon
    await nav.myTicketsLink.click();
    await expect(page).toHaveURL(/\/agent\/tickets$/);

    await nav.takeNumberLink.click();
    await expect(page).toHaveURL(/\/numerator$/);
  });
});

/* -------------------- ADMIN -------------------- */
test.describe("Navbar (admin)", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedInAdmin(page);
  });
  test("should show admin links and navigate", async ({ page }) => {
    const nav = new NavbarPage(page);
    await nav.goto(BASE);

    await expect(nav.takeNumberLink).toHaveCount(1);
    await expect(nav.dashboardLink).toHaveCount(1);
    await expect(nav.createAdminLink).toHaveCount(1);
    await expect(nav.createAgentLink).toHaveCount(1);
    await expect(nav.listUsersLink).toHaveCount(1);
    await expect(nav.logoutButton).toHaveCount(1);
    await expect(nav.profileImageLink).toHaveCount(1);

    await expect(nav.myTicketsLink).toHaveCount(0);
    await expect(nav.signInLink).toHaveCount(0);
    await expect(nav.signUpLink).toHaveCount(0);

    await nav.createAdminLink.click();
    await expect(page).toHaveURL(/\/admin\/create$/);

    await nav.createAgentLink.click();
    await expect(page).toHaveURL(/\/admin\/agents$/);

    await nav.listUsersLink.click();
    await expect(page).toHaveURL(/\/admin\/users$/);
  });
});

/* -------------------- DEFAULT (signed-in regular user) -------------------- */
test.describe("Navbar (default user)", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedInDefault(page);
  });

  test("should show basic links for default user", async ({ page }) => {
    const nav = new NavbarPage(page);
    await nav.goto(BASE);

    await expect(nav.takeNumberLink).toHaveCount(1);
    await expect(nav.logoutButton).toHaveCount(1);
    await expect(nav.profileImageLink).toHaveCount(1);

    await expect(nav.dashboardLink).toHaveCount(0);
    await expect(nav.createAdminLink).toHaveCount(0);
    await expect(nav.createAgentLink).toHaveCount(0);
    await expect(nav.listUsersLink).toHaveCount(0);
    await expect(nav.myTicketsLink).toHaveCount(0);

    await expect(nav.signInLink).toHaveCount(0);
    await expect(nav.signUpLink).toHaveCount(0);

    await nav.takeNumberLink.click();
    await expect(page).toHaveURL(/\/numerator$/);
  });
});
