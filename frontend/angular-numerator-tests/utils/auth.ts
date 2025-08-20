import { Page, Route } from "@playwright/test";

export async function ensureLoggedInAgent(
  page: Page,
  opts?: {
    tokenKey?: string; 
    tokenValue?: string; // mock JWT
    user?: { id: number; email: string; role: string; username: string };
  }
) {
  const tokenKey = opts?.tokenKey ?? "access_token";
  const tokenValue = opts?.tokenValue ?? "test-jwt-token";
  const user = opts?.user ?? {
    id: 1,
    email: "agenttest@example.com",
    role: "Agent",
    username: "AgentTester",
  };

  await page.addInitScript(
    ([k, v]) => localStorage.setItem(k, v),
    [tokenKey, tokenValue]
  );

  await page.route(/\/api\/auth\/me(\?.*)?$/i, async (route: Route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(user),
    });
  });

}
export async function ensureLoggedInDefault(
  page: Page,
  opts?: {
    tokenKey?: string; 
    tokenValue?: string; // mock JWT
    user?: { id: number; email: string; role: string; username: string };
  }
) {
  const tokenKey = opts?.tokenKey ?? "access_token";
  const tokenValue = opts?.tokenValue ?? "test-jwt-token";
  const user = opts?.user ?? {
    id: 2,
    email: "defaulttest@example.com",
    role: "Default",
    username: "DefaultTestUser",
  };

  await page.addInitScript(
    ([k, v]) => localStorage.setItem(k, v),
    [tokenKey, tokenValue]
  );

  await page.route(/\/api\/auth\/me(\?.*)?$/i, async (route: Route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(user),
    });
  });

  await page.route(
    /\/api\/(users\/me|profile)(\?.*)?$/i,
    async (route: Route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(user),
      });
    }
  );
}

export async function ensureLoggedInAdmin(
  page: Page,
  opts?: {
    tokenKey?: string; 
    tokenValue?: string; // mock JWT
    user?: { id: number; email: string; role: string; username: string };
  }
) {
  const tokenKey = opts?.tokenKey ?? "access_token";
  const tokenValue = opts?.tokenValue ?? "test-jwt-token";
  const user = opts?.user ?? {
    id: 3,
    email: "admintest@example.com",
    role: "Admin",
    username: "AdminTestUser",
  };

  await page.addInitScript(
    ([k, v]) => localStorage.setItem(k, v),
    [tokenKey, tokenValue]
  );

  await page.route(/\/api\/auth\/me(\?.*)?$/i, async (route: Route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(user),
    });
  });

  await page.route(
    /\/api\/(users\/me|profile)(\?.*)?$/i,
    async (route: Route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(user),
      });
    }
  );
}