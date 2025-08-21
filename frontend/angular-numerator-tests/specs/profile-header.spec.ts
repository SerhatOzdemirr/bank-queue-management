import { test, expect, Page } from "@playwright/test";
import { ProfileHeaderPage } from "../page-objects/profile-header.page";
import { ensureLoggedInDefault, } from "../utils/auth";

const BASE_URL = "http://localhost:4200";

type Profile = {
  id: number;
  username: string;
  email: string;
  role: string;
  avatarUrl: string;
};

async function setupProfileMocks(page: Page) {
  const state: { profile: Profile } = {
    profile: {
      id: 7,
      username: "Test Default",
      email: "testdefault@mail.com",
      role: "User",
      avatarUrl: "http://localhost:5034/media/avatars/u1.png",
    },
  };

  // GET /api/profile
  await page.route("**/api/profile", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: state.profile });
      return;
    }
    if (route.request().method() === "PUT") {
      const body = await route
        .request()
        .postDataJSON()
        .catch(() => ({} as any));
      if (body?.name) state.profile.username = body.name;
      if (body?.email) state.profile.email = body.email;

      // işte burayı değiştir
      await route.fulfill({ json: state.profile, status: 200 });
      return;
    }
    await route.continue();
  });

  await page.route("**/api/profile/statistics", async (route) => {
    await route.fulfill({
      json: { approved: 2, pending: 1, rejected: 0, total: 3 },
    });
  });

  await page.route("**/api/profile/ticket-history", async (route) => {
    await route.fulfill({
      json: [
        { serviceKey: "ACC", number: 101, status: "approved" },
        { serviceKey: "SUP", number: 102, status: "pending" },
      ],
    });
  });

  return state;
}

test.describe("Profile Header (real auth + mocked profile API)", () => {
  let profile: ProfileHeaderPage;

  test.beforeEach(async ({ page }) => {
    await setupProfileMocks(page);

    await ensureLoggedInDefault(page);
    profile = new ProfileHeaderPage(page);
    await profile.navigateTo(BASE_URL);
  });

  test("shows initial profile header info", async () => {
    await expect(profile.username).toHaveText("Welcome Test Default");
    await expect(profile.email).toHaveText("testdefault@mail.com");
    await expect(profile.role).toHaveText(/user/i);
    await expect(profile.avatarImg).toBeVisible();
  });

  test("opens and closes edit modal", async () => {
    await profile.openEditModal();
    await expect(profile.modal).toBeVisible();

    await profile.closeEditModal();
    await expect(profile.modal).toHaveCount(0);
  });

});
