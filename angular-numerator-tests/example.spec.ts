import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:4200';

async function login(
  page: any,
  username: string,
  email: string,
  password: string
) {
  await page.goto(baseUrl);
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('E-mail').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
}

async function takeNumber(page: any, expectedNumber: number) {
  const btn = page.getByRole('button', { name: 'Take the Number' });
  await expect(btn).toBeVisible();
  await btn.click();
  await expect(page.locator('.taken-number')).toHaveText(
    `Your Number is: ${expectedNumber}`
  );
}

test.describe('Numerator App - Registration/Login', () => {
  test.beforeEach(async ({ page }) => {
    // Her testten önce temiz localStorage
    await page.goto(baseUrl);
    await page.evaluate(() => localStorage.clear());
  });

  test('Login sayfası başlığı görünür olmalı', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('Boş tüm alanlar hata göstermeli', async ({ page }) => {
    await login(page, '', '', '');
    await expect(page.locator('.login-error')).toHaveText('All fields are required.');
  });

  test('Eksik username hata göstermeli', async ({ page }) => {
    await login(page, '', 'a@mail.com', 'pw');
    await expect(page.locator('.login-error')).toHaveText('All fields are required.');
  });

  test('Eksik email hata göstermeli', async ({ page }) => {
    await login(page, 'UserX', '', 'pw');
    await expect(page.locator('.login-error')).toHaveText('All fields are required.');
  });

  test('Eksik password hata göstermeli', async ({ page }) => {
    await login(page, 'UserX', 'a@mail.com', '');
    await expect(page.locator('.login-error')).toHaveText('All fields are required.');
  });

  test('5 farklı kullanıcı art arda 1–5 numaralarını almalı', async ({
    page,
  }) => {
    const users = [
      { username: 'User1', email: 'u1@mail.com', password: '123' },
      { username: 'User2', email: 'u2@mail.com', password: '124' },
      { username: 'User3', email: 'u3@mail.com', password: '125' },
      { username: 'User4', email: 'u4@mail.com', password: '126' },
      { username: 'User5', email: 'u5@mail.com', password: '127' },
    ];
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      await login(page, u.username, u.email, u.password);
      await takeNumber(page, i + 1);
    }
  });

  test('Aynı kullanıcı tekrar girince aynı numarayı almalı', async ({
    page,
  }) => {
    const user = {
      username: 'Serhat',
      email: 'serhat@mail.com',
      password: '123456',
    };
    await login(page, user.username, user.email, user.password);
    await takeNumber(page, 1);

    // Case: aynı kimlikle yeniden
    await login(page, user.username, user.email, user.password);
    await takeNumber(page, 1);
  });

  test('Farklı username + aynı email+password hata göstermeli', async ({
    page,
  }) => {
    // Önce Alice kaydolur
    await login(page, 'Alice', 'dup@mail.com', 'pw1');
    await takeNumber(page, 1);

    // Bob, aynı email+password ile denediğinde hata
    await login(page, 'Bob', 'dup@mail.com', 'pw1');
    await expect(page.locator('.login-error')).toHaveText(
      'This email or password is already used by another user.'
    );
  });

  test('Farklı username+aynı email+farklı password hata göstermeli', async ({
    page,
  }) => {
    await login(page, 'Carol', 'dup2@mail.com', 'pw2');
    await takeNumber(page, 1);

    await login(page, 'Dave', 'dup2@mail.com', 'pwX');
    await expect(page.locator('.login-error')).toHaveText(
      'This email or password is already used by another user.'
    );
  });

  test('Farklı username+farklı email+aynı password hata göstermeli', async ({
    page,
  }) => {
    await login(page, 'Eve', 'eve@mail.com', 'commonPW');
    await takeNumber(page, 1);

    await login(page, 'Frank', 'frank@mail.com', 'commonPW');
    await expect(page.locator('.login-error')).toHaveText(
      'This email or password is already used by another user.'
    );
  });

  test('Email büyük-küçük harf farkını gözardı etmeli', async ({ page }) => {
    // BÜYÜK harfli email ile kaydol
    await login(page, 'CaseUser', 'CASE@MAIL.COM', 'pwCase');
    await takeNumber(page, 1);

    // küçük harfli email ile tekrar
    await login(page, 'CaseUser', 'case@mail.com', 'pwCase');
    await takeNumber(page, 1);
  });

  test('Girişteki baş ve sondaki boşlukları trim etmeli', async ({ page }) => {
    await login(page, '   TrimUser   ', '  trim@mail.com  ', '  pwTrim  ');
    await takeNumber(page, 1);

    // Aynı kullanıcı, farklı boşluk formatıyla
    await login(page, 'TrimUser', 'trim@mail.com', 'pwTrim');
    await takeNumber(page, 1);
  });
});
