import { Page, request } from "@playwright/test";

type DirectLoginOpts = {
  appUrl?: string;
  apiUrl?: string;
  email: string;
  password: string;
  tokenKey?: string; 
  postLoginPath?: string;
};

export async function loginDirectAndSetToken(
  page: Page,
  {
    appUrl = "http://localhost:4200",
    apiUrl = "http://localhost:5034/api/auth",
    email,
    password,
    tokenKey = "token", 
    postLoginPath = "/profile",
  }: DirectLoginOpts
) {
  const contextReq = await request.newContext();
  const res = await contextReq.post(`${apiUrl}/login`, {
    data: { email, password },
  });

  if (!res.ok()) {
    throw new Error(`Login API failed: ${res.status()} ${await res.text()}`);
  }

  const body = await res.json();
  const token = body[tokenKey] ?? body.token ?? body.access_token;
  if (!token) {
    throw new Error("Token not found in login response");
  }

  console.log(`🔑 Direct token for ${email}:${token}`);

  await page.addInitScript(
    ([k, v]) => {
      localStorage.setItem(k, v);
    },
    [tokenKey, token]
  );

  await page.goto(`${appUrl}${postLoginPath}`);

  return token;
}

export async function ensureLoggedInAdmin(page: Page) {
  return loginDirectAndSetToken(page, {
    email: "u1@mail.com",
    password: "123",
  });
}

export async function ensureLoggedInAgent(page: Page) {
  return loginDirectAndSetToken(page, {
    email: "agent@mail.com",
    password: "123",
  });
}

export async function ensureLoggedInDefault(page: Page) {
  return loginDirectAndSetToken(page, {
    email: "testdefault@mail.com",
    password: "123",
  });
}
