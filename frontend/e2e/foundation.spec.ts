import { expect, test } from '@playwright/test'
import { customer, login } from './helpers'

const hasCustomer = Boolean(customer.email && customer.name)

test('the portal header shows the real customer name from the API', async ({ page }) => {
  test.skip(!hasCustomer, 'E2E_CUSTOMER_EMAIL and E2E_CUSTOMER_NAME are not set')
  await login(page, customer)
  await page.goto('/portal')
  await expect(page.locator('header').getByText(customer.name!)).toBeVisible()
})

test('the built page carries the CSRF token', async ({ page }) => {
  test.skip(!hasCustomer, 'E2E_CUSTOMER_EMAIL and E2E_CUSTOMER_NAME are not set')
  await login(page, customer)
  await page.goto('/portal')
  expect(await page.evaluate(() => (window as any).csrf_token)).toMatch(/\w{10,}/)
})

test('a deep link and a refresh load the scripts and the right name', async ({ page }) => {
  test.skip(!hasCustomer, 'E2E_CUSTOMER_EMAIL and E2E_CUSTOMER_NAME are not set')
  const failedAssets: string[] = []
  page.on('response', (response) => {
    if (response.url().includes('/assets/') && response.status() >= 400) failedAssets.push(response.url())
  })
  await login(page, customer)
  await page.goto('/portal/account/profile')
  await expect(page.locator('header').getByText(customer.name!)).toBeVisible()
  await page.reload()
  await expect(page.locator('header').getByText(customer.name!)).toBeVisible()
  expect(failedAssets).toEqual([])
})

test('a guest can open /promo', async ({ page }) => {
  const response = await page.goto('/promo')
  expect(response?.status()).toBe(200)
  await expect(page).toHaveURL(/\/promo$/)
  await expect(page.locator('#root')).not.toBeEmpty()
})

test('a guest at /start/locate without an address is sent to /promo', async ({ page }) => {
  await page.goto('/start/locate')
  await expect(page).toHaveURL(/\/promo$/)
})

test('the existing summer special page is still served', async ({ page }) => {
  const response = await page.goto('/promo/summer-special')
  expect(response?.status()).toBe(200)
  await expect(page.locator('#root')).toHaveCount(0)
})
