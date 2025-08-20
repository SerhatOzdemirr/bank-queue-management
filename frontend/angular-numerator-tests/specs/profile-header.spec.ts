import { test, expect, Page, Route } from "@playwright/test";
import { ProfileHeaderPage } from "../page-objects/profile-header.page";
import { ensureLoggedInDefault } from "../utils/auth";

const BASE = "http://localhost:4200";

const profileFixture = {
  id: 1,
  username: "JohnDoe",
  email: "john@example.com",
  priorityScore: 10,
  role: "Default",
  avatarUrl: "/avatars/john.png",
};

async function mockProfileApi(page: Page, profile = profileFixture) {
  await page.route("**/api/profile", async (route: Route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(profile),
      });
      return;
    }
    if (method === "PUT") {
      const body = await route.request().postDataJSON();
      const updated = { ...profile, ...body };
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(updated),
      });
      return;
    }
    await route.continue();
  });

  await page.route("**/api/profile/avatar", async (route: Route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        url: "/avatars/new.png",
        relativeUrl: "/avatars/new.png",
      }),
    });
  });
}

test.describe.serial("ProfileHeader component", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedInDefault(page, {
      tokenKey: "access_token",
    });
    await mockProfileApi(page);
  });

  test("should display correct user information", async ({ page }) => {
    const ph = new ProfileHeaderPage(page);
    await ph.navigateTo(BASE);

    await expect(ph.username).toHaveText(`Welcome ${profileFixture.username}`);
    await expect(ph.email).toHaveText(profileFixture.email);
    await expect(ph.role).toHaveText(`Role: ${profileFixture.role}`);
    await expect(ph.avatarImg).toHaveAttribute("src", /avatars\/john\.png/);
  });

  test("Edit model open and close update profile", async ({ page }) => {
    const ph = new ProfileHeaderPage(page);
    await ph.navigateTo(BASE);

    await ph.openEditModal();
    await expect(ph.modal).toBeVisible();

    await ph.updateProfile("JaneDoe", "jane@example.com", "secret");
    await expect(ph.modal).toBeHidden();

    await expect(ph.username).toHaveText("Welcome JaneDoe");
    await expect(ph.email).toHaveText("jane@example.com");
  });
});
