import { expect, test } from '@playwright/test'
import { customer, login, staff } from './helpers'

test('guest sees the landing page with Log in', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('.btn-login')).toHaveText(/Log in/)
  await expect(page.locator('.btn-login')).toHaveAttribute('href', '/login')
})

test('customer sees the landing page and View dashboard opens the portal', async ({ page }) => {
  test.skip(!customer.email, 'E2E_CUSTOMER_EMAIL is not set')
  await login(page, customer)
  await expect(page).toHaveURL(/\/portal/)
  await page.goto('/')
  await expect(page).toHaveURL(/\/$/)
  await page.locator('.btn-login').click()
  await expect(page).toHaveURL(/\/portal/)
})

test('staff sees the landing page and View dashboard opens Desk', async ({ page }) => {
  test.skip(!staff.email, 'E2E_STAFF_EMAIL is not set')
  await login(page, staff)
  await expect(page).toHaveURL(/\/app/)
  await page.goto('/')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('.btn-login')).toHaveText(/View dashboard/)
  await expect(page.locator('.btn-login')).toHaveAttribute('href', '/app')
})
