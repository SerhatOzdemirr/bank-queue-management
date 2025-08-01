// utils/testSetup.ts
import { Page, BrowserContext, request, expect ,APIRequestContext } from '@playwright/test';

const BASE_URL = 'http://localhost:4200';
const API_URL  = 'http://localhost:5034';

export { BASE_URL, API_URL };

export async function initializePageObject<T>(
  page: Page,
  context: BrowserContext,
  requestContext: APIRequestContext, 
  PageObjectClass: new (page: Page) => T,
  navigate?: (instance: T) => Promise<void>
): Promise<T> {
  const reset = await requestContext.post(`${API_URL}/api/test/reset`);
  expect(reset.ok()).toBeTruthy();

  await context.clearCookies();
  await page.goto(BASE_URL);
  await page.evaluate(() => localStorage.clear());

  const pageObject = new PageObjectClass(page);

  if (navigate) {
    await navigate(pageObject);
  }

  return pageObject;
}
