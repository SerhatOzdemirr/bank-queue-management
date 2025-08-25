import { test, expect } from "@playwright/test";
import { AdminUsersPage } from "../page-objects/admin-users.page";
import { ensureLoggedInAdminForAdminUsersTest } from "../utils/auth";
const BASE = "http://localhost:4200/admin/users";
const GET_USERS = "**/api/admin/users";
const PUT_PRIORITY = "**/api/admin/users/*/priority";

test.describe.serial("POM Admin Users page (mocked API)", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedInAdminForAdminUsersTest(page);
    await page.route(GET_USERS, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: 3,
            username: "agent2",
            email: "a2@mail.com",
            priorityScore: 0,
            role: "Agent",
          },
          {
            id: 4,
            username: "user",
            email: "user@mail.com",
            priorityScore: 2,
            role: "Default",
          },
        ]),
      });
    });
  });

  test("renders mocked users", async ({ page }) => {
    const admin = new AdminUsersPage(page);
    await page.goto(BASE);
    await expect(admin.rowByEmail("a2@mail.com")).toBeVisible();
    const row = await admin.readByEmail("a2@mail.com");
    expect(row.priority).toBe(0);
  });

  test("updates priority and sends PUT with body {score:4}", async ({
    page,
  }) => {
    let received: any;
    const handled = new Promise<void>(async (resolve) => {
      await page.route(PUT_PRIORITY, async (route) => {
        received = route.request().postDataJSON();
        await route.fulfill({ status: 204, body: "" });
        resolve();
      });
    });

    const admin = new AdminUsersPage(page);
    await page.goto(BASE);

    const row = admin.rowByEmail("a2@mail.com").first();
    await admin.setPriority(row, 4);
    await admin.save(row);
    await handled;

    expect(received).toEqual({ score: 4 });
    const after = await admin.readByEmail("a2@mail.com");
    expect(after.priority).toBe(4);
  });

  test("blocks invalid values on client (no PUT)", async ({ page }) => {
    let called = false;
    await page.route(PUT_PRIORITY, async (route) => {
      called = true;
      await route.fulfill({ status: 204, body: "" });
    });

    const admin = new AdminUsersPage(page);
    await page.goto(BASE);

    page.once("dialog", async (d) => {
      expect(d.message()).toContain("Priority must be between 1 and 5");
      await d.accept();
    });

    const row = admin.rowByEmail("a2@mail.com").first();
    await admin.setPriority(row, 9);
    await admin.save(row);

    expect(called).toBeFalsy();
  });
});
