import { test, expect } from "@playwright/test";
import { AgentTicketsPage } from "../page-objects/agent-tickets.page";
import { ensureLoggedInAgent } from "../utils/auth";
const BASE = "http://localhost:4200/agent/tickets";
const GET_USERS = "**/api/agent/tickets";

test.describe.serial("POM Admin Users page (mocked API)", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedInAgent(page);
    await page.route(GET_USERS, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            ticketId: 30,
            number: 16,
            serviceKey: "test",
            serviceLabel: "testService",
            takenAt: "2025-08-19T11:55:22.574769Z",
            assignedAt: "2025-08-19T11:55:22.577726Z",
            status: "Pending",
            username: "agent1",
            effectivePriority: 5,
          },
          {
            ticketId: 45,
            number: 4,
            serviceKey: "test2",
            serviceLabel: "test2Service",
            takenAt: "2025-08-19T11:55:22.574769Z",
            assignedAt: "2025-08-19T11:55:22.577726Z",
            status: "Pending",
            username: "agent1",
            effectivePriority: 5,
          },
        ]),
      });
    });
  });

  test("renders mocked tickets", async ({ page }) => {
    const agent = new AgentTicketsPage(page);
    await page.goto(BASE);
    const row = agent.rowByIndex(0);
    const data = await agent.readRow(row);
    expect(data.service).toContain("testService");
    expect(data.status).toBe("Pending");
  });

  test("accept ticket triggers accept button", async ({ page }) => {
    const agent = new AgentTicketsPage(page);
    await page.goto(BASE);

    const row = agent.rowByNumber(16);

    await agent.acceptTicket(row);
  });

  test("reject ticket triggers reject button", async ({ page }) => {
    const agent = new AgentTicketsPage(page);
    await page.goto(BASE);

    const row = agent.rowByNumber(4);
    await agent.rejectTicket(row);
  });
});
