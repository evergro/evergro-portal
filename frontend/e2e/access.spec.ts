import { expect, test } from '@playwright/test'
import { customer, login } from './helpers'

test('guest at /portal/schedule logs in and returns to it', async ({ page }) => {
  test.skip(!customer.email, 'E2E_CUSTOMER_EMAIL is not set')
  await page.goto('/portal/schedule')
  await expect(page).toHaveURL(/\/login\?redirect-to=\/portal\/schedule/)
  await login(page, customer, page.url())
  await expect(page).toHaveURL(/\/portal\/schedule/)
})

test('logged in customer who opens /login goes to the portal', async ({ page }) => {
  test.skip(!customer.email, 'E2E_CUSTOMER_EMAIL is not set')
  await login(page, customer)
  await page.goto('/login')
  await expect(page).toHaveURL(/\/portal/)
})

test('customer who opens /app does not get Desk', async ({ page }) => {
  test.skip(!customer.email, 'E2E_CUSTOMER_EMAIL is not set')
  await login(page, customer)
  const response = await page.goto('/app')
  expect(response?.status()).toBe(403)
})

test('wrong password shows a plain message', async ({ page }) => {
  await page.goto('/login')
  await page.locator('#usr').fill('nobody@example.com')
  await page.locator('#pwd').fill('wrong-password')
  await page.locator('#submitBtn').click()
  await expect(page).toHaveURL(/\/login/)
  await expect(page.locator('#errorMsg')).toBeVisible()
})
