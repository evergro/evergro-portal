import { type Page } from '@playwright/test'

export type Account = { email: string; password: string; name?: string }

// Credentials come from the environment so no password is stored in the repo.
export const customer: Account = {
  email: process.env.E2E_CUSTOMER_EMAIL ?? '',
  password: process.env.E2E_CUSTOMER_PASSWORD ?? '',
  name: process.env.E2E_CUSTOMER_NAME ?? '',
}
export const staff: Account = {
  email: process.env.E2E_STAFF_EMAIL ?? '',
  password: process.env.E2E_STAFF_PASSWORD ?? '',
}

export async function login(page: Page, account: Account, path = '/login') {
  await page.goto(path)
  await page.locator('#usr').fill(account.email)
  await page.locator('#pwd').fill(account.password)
  await page.locator('#submitBtn').click()
  // Desk can take several seconds on its first load
  await page.waitForURL((url) => url.pathname !== '/login', { timeout: 30_000 })
}
